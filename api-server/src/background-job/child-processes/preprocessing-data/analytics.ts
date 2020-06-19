import { RawDataDocumentModel } from '@service/raw-data/interface';
import { VisualAnalyticsDocumentModel } from '@service/visual/analytics/interface';
import VisualAnalyticsLogic from '@service/visual/analytics/VisualAnalyticsLogic';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import {
    setStateCache,
    StateCacheProperties,
} from '@background-job/child-processes/preprocessing-data/preprocessing-data';

/**
 * Handle visualization analytics data
 */
const handleVisualizationAnalytics = async ({
    _id,
    postDate,
    transactionType,
    propertyType,
    price,
    acreage,
}: RawDataDocumentModel): Promise<void> => {
    const visualAnalyticsLogic = VisualAnalyticsLogic.getInstance();
    const month = new Date(postDate).getMonth() + 1;
    const year = new Date(postDate).getFullYear();
    const priceValue = price.value;
    const acreageValue = acreage.value;
    const newAverage = Math.round((priceValue / acreageValue) * 100) / 100;
    const targetDocument = await visualAnalyticsLogic.getOne({
        month,
        year,
        transactionType,
        propertyType,
    });

    if (!targetDocument) {
        const newDocument = await visualAnalyticsLogic.create({
            month,
            year,
            transactionType,
            propertyType,
            amount: 1,
            sumAverage: newAverage,
            average: newAverage,
            max: priceValue,
            min: priceValue,
            maxAverage: newAverage,
            minAverage: newAverage,
        } as VisualAnalyticsDocumentModel);
        newDocument.isNew = true;
        setStateCache(StateCacheProperties.ANALYTICS, newDocument);
        return;
    }

    setStateCache(StateCacheProperties.ANALYTICS, targetDocument);
    targetDocument.amount++;
    targetDocument.sumAverage =
        Math.round((targetDocument.sumAverage + newAverage) * 100) / 100;
    targetDocument.average =
        Math.round((targetDocument.sumAverage / targetDocument.amount) * 100) /
        100;
    targetDocument.max =
        priceValue > targetDocument.max ? priceValue : targetDocument.max;
    targetDocument.min =
        priceValue < targetDocument.min ? priceValue : targetDocument.min;
    targetDocument.maxAverage =
        newAverage > targetDocument.maxAverage
            ? newAverage
            : targetDocument.maxAverage;
    targetDocument.minAverage =
        newAverage < targetDocument.minAverage
            ? newAverage
            : targetDocument.minAverage;

    await targetDocument.save();
};

/**
 * Analytics data phase
 */
export const analyticsPhase = async (
    rawData: RawDataDocumentModel
): Promise<void> => {
    await handleVisualizationAnalytics(rawData);
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Preprocessing data - Analytics - RID: ${rawData._id}`
    ).show();
};

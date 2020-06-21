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
    const newPerMeter = Math.round((priceValue / acreageValue) * 100) / 100;
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
            perMeterSum: newPerMeter,
            perMeterAverage: newPerMeter,
            priceMax: priceValue,
            priceMin: priceValue,
            perMeterMax: newPerMeter,
            perMeterMin: newPerMeter,
        } as VisualAnalyticsDocumentModel);
        newDocument.isNew = true;
        setStateCache(StateCacheProperties.ANALYTICS, newDocument);
        return;
    }

    setStateCache(StateCacheProperties.ANALYTICS, targetDocument);
    targetDocument.amount++;
    targetDocument.perMeterSum =
        Math.round((targetDocument.perMeterSum + newPerMeter) * 100) / 100;
    targetDocument.perMeterAverage =
        Math.round((targetDocument.perMeterSum / targetDocument.amount) * 100) /
        100;
    targetDocument.priceMax =
        priceValue > targetDocument.priceMax
            ? priceValue
            : targetDocument.priceMax;
    targetDocument.priceMin =
        priceValue < targetDocument.priceMin
            ? priceValue
            : targetDocument.priceMin;
    targetDocument.perMeterMax =
        newPerMeter > targetDocument.perMeterMax
            ? newPerMeter
            : targetDocument.perMeterMax;
    targetDocument.perMeterMin =
        newPerMeter < targetDocument.perMeterMin
            ? newPerMeter
            : targetDocument.perMeterMin;

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

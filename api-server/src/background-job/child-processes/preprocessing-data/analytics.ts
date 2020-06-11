import { RawDataDocumentModel } from '@service/raw-data/interface';
import { VisualAnalyticsDocumentModel } from '@service/visual/analytics/interface';
import VisualAnalyticsLogic from '@service/visual/analytics/VisualAnalyticsLogic';
import RawDataLogic from '@service/raw-data/RawDataLogic';

/**
 * Handle visualization analytics data
 *
 * @param {RawDataDocumentModel} input
 */
export const handleVisualizationAnalytics = async ({
    _id,
    postDate,
    transactionType,
    propertyType,
    price,
    acreage,
    status,
}: RawDataDocumentModel): Promise<void> => {
    const visualAnalyticsLogic = VisualAnalyticsLogic.getInstance();
    const rawDataLogic = RawDataLogic.getInstance();
    const month = new Date(postDate).getMonth() + 1;
    const year = new Date(postDate).getFullYear();
    const priceConverted = price.value / 1000000;
    const newAverage = Math.round((priceConverted / acreage.value) * 100) / 100;
    const visualAnalyticsDocument = await visualAnalyticsLogic.getOne({
        month,
        year,
        transactionType,
        propertyType,
    });

    if (!visualAnalyticsDocument) {
        await visualAnalyticsLogic.create({
            month,
            year,
            transactionType,
            propertyType,
            amount: 1,
            sumAverage: newAverage,
            average: newAverage,
            max: priceConverted,
            min: priceConverted,
            maxAverage: newAverage,
            minAverage: newAverage,
        } as VisualAnalyticsDocumentModel);

        return;
    }
    visualAnalyticsDocument.amount++;
    visualAnalyticsDocument.sumAverage += newAverage;
    visualAnalyticsDocument.average =
        Math.round(
            (visualAnalyticsDocument.sumAverage /
                visualAnalyticsDocument.amount) *
                100
        ) / 100;
    visualAnalyticsDocument.max =
        priceConverted > visualAnalyticsDocument.max
            ? priceConverted
            : visualAnalyticsDocument.max;
    visualAnalyticsDocument.min =
        priceConverted < visualAnalyticsDocument.min
            ? priceConverted
            : visualAnalyticsDocument.min;
    visualAnalyticsDocument.maxAverage =
        newAverage > visualAnalyticsDocument.maxAverage
            ? newAverage
            : visualAnalyticsDocument.maxAverage;
    visualAnalyticsDocument.minAverage =
        newAverage < visualAnalyticsDocument.minAverage
            ? newAverage
            : visualAnalyticsDocument.minAverage;

    status.isAnalytics = true;
    await Promise.all([
        visualAnalyticsLogic.update(
            visualAnalyticsDocument._id,
            visualAnalyticsDocument
        ),
        rawDataLogic.update(_id, { status } as RawDataDocumentModel),
    ]);
};

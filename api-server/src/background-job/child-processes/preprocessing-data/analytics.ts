import { RawDataDocumentModel } from '@service/raw-data/interface';
import { VisualAnalyticsDocumentModel } from '@service/visual/analytics/interface';
import VisualAnalyticsLogic from '@service/visual/analytics/VisualAnalyticsLogic';
import RawDataLogic from '@service/raw-data/RawDataLogic';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import { DOCUMENT_LIMIT } from '@background-job/child-processes/preprocessing-data/constant';

const rawDataLogic = RawDataLogic.getInstance();

/**
 * Handle visualization analytics data
 *
 * @param {RawDataDocumentModel} input
 */
const handleVisualizationAnalytics = async ({
    _id,
    postDate,
    transactionType,
    propertyType,
    price,
    acreage,
    status,
}: RawDataDocumentModel): Promise<void> => {
    const visualAnalyticsLogic = VisualAnalyticsLogic.getInstance();
    const month = new Date(postDate).getMonth() + 1;
    const year = new Date(postDate).getFullYear();
    const priceValue = price.value;
    const acreageValue = acreage.value;
    const newAverage = Math.round((priceValue / acreageValue) * 100) / 100;
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
            max: priceValue,
            min: priceValue,
            maxAverage: newAverage,
            minAverage: newAverage,
        } as VisualAnalyticsDocumentModel);

        return;
    }
    visualAnalyticsDocument.amount++;
    visualAnalyticsDocument.sumAverage =
        Math.round((visualAnalyticsDocument.sumAverage + newAverage) * 100) /
        100;
    visualAnalyticsDocument.average =
        Math.round(
            (visualAnalyticsDocument.sumAverage /
                visualAnalyticsDocument.amount) *
                100
        ) / 100;
    visualAnalyticsDocument.max =
        priceValue > visualAnalyticsDocument.max
            ? priceValue
            : visualAnalyticsDocument.max;
    visualAnalyticsDocument.min =
        priceValue < visualAnalyticsDocument.min
            ? priceValue
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

/**
 * Analytics data phase
 */
export const analyticsPhase = async (script: AsyncGenerator): Promise<void> => {
    let documents = (
        await rawDataLogic.getAll({
            limit: DOCUMENT_LIMIT,
            conditions: {
                'status.isAnalytics': false,
            },
        })
    ).documents;

    while (documents.length > 0) {
        for (const rawData of documents) {
            try {
                await handleVisualizationAnalytics(rawData);
                new ConsoleLog(
                    ConsoleConstant.Type.INFO,
                    `Preprocessing data - Analytics - RID: ${rawData._id}`
                ).show();
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Preprocessing data - Analytics - RID: ${rawData._id} - Error: ${error.message}`
                ).show();
            }
        }
        documents = (
            await rawDataLogic.getAll({
                limit: DOCUMENT_LIMIT,
                conditions: {
                    'status.isAnalytics': false,
                },
            })
        ).documents;
    }
    script.next();
};

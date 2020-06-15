import RawDataLogic from '@service/raw-data/RawDataLogic';
import { RawDataDocumentModel } from '@service/raw-data/interface';
import { DOCUMENT_LIMIT } from '@background-job/child-processes/preprocessing-data/constant';
import { mapPointPhase } from '@background-job/child-processes/preprocessing-data/map-point';
import { summaryPhase } from '@background-job/child-processes/preprocessing-data/summary';
import { analyticsPhase } from '@background-job/child-processes/preprocessing-data/analytics';

export const preprocessingDataPhase = async (
    script: AsyncGenerator
): Promise<void> => {
    const rawDataLogic = RawDataLogic.getInstance();
    let documents: RawDataDocumentModel[] = (
        await rawDataLogic.getAll({
            limit: DOCUMENT_LIMIT,
            conditions: {
                $or: [
                    { 'status.isMapPoint': false },
                    { 'status.isSummary': false },
                    { 'status.isAnalytics': false },
                ],
            },
        })
    ).documents;

    while (documents.length > 0) {
        for (const rawData of documents) {
            if (!rawData.status.isMapPoint && rawData.coordinateId) {
                const result = await mapPointPhase(rawData);
                if (!result) {
                    await rawDataLogic.delete(rawData._id);
                    continue;
                }
                rawData.status.isMapPoint = true;
            }

            if (!rawData.status.isSummary) {
                const result = await summaryPhase(rawData);
                if (!result) {
                    await rawDataLogic.delete(rawData._id);
                    continue;
                }
                rawData.status.isSummary = true;
            }

            if (!rawData.status.isAnalytics) {
                const result = await analyticsPhase(rawData);
                if (!result) {
                    await rawDataLogic.delete(rawData._id);
                    continue;
                }
                rawData.status.isAnalytics = true;
            }

            await rawData.save();
        }

        documents = (
            await rawDataLogic.getAll({
                limit: DOCUMENT_LIMIT,
                conditions: {
                    $or: [
                        { 'status.isMapPoint': false },
                        { 'status.isSummary': false },
                        { 'status.isAnalytics': false },
                    ],
                },
            })
        ).documents;
    }

    script.next();
};

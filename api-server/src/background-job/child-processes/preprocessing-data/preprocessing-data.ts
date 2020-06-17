import RawDataLogic from '@service/raw-data/RawDataLogic';
import { RawDataDocumentModel } from '@service/raw-data/interface';
import { DOCUMENT_LIMIT } from '@background-job/child-processes/preprocessing-data/constant';
import { mapPointPhase } from '@background-job/child-processes/preprocessing-data/map-point';
import { summaryPhase } from '@background-job/child-processes/preprocessing-data/summary';
import { analyticsPhase } from '@background-job/child-processes/preprocessing-data/analytics';
import {
    AggregationGroupDataResult,
    getRepresent,
    GroupDataCache,
    groupDataPhase,
} from '@background-job/child-processes/preprocessing-data/group-data';

export const preprocessingDataPhase = async (
    script: AsyncGenerator
): Promise<void> => {
    const rawDataLogic = RawDataLogic.getInstance();
    const groupDataCacheList: GroupDataCache[] = [];
    const queryConditions = {
        limit: DOCUMENT_LIMIT,
        conditions: {
            $or: [
                { 'status.isMapPoint': false },
                { 'status.isGrouped': false },
                { 'status.isSummary': false },
                { 'status.isAnalytics': false },
            ],
        },
    };
    let documents: RawDataDocumentModel[] = (
        await rawDataLogic.getAll(queryConditions)
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

            if (!rawData.status.isGrouped) {
                let groupDataCache:
                    | GroupDataCache
                    | undefined = groupDataCacheList.find(
                    ({ transactionType, propertyType }) =>
                        transactionType === rawData.transactionType &&
                        propertyType === rawData.propertyType
                );
                if (!groupDataCache) {
                    const groupDataRepresent: AggregationGroupDataResult[] = await getRepresent(
                        rawData.transactionType,
                        rawData.propertyType
                    );
                    groupDataCache = {
                        transactionType: rawData.transactionType,
                        propertyType: rawData.propertyType,
                        items: groupDataRepresent,
                    };
                    groupDataCacheList.push(groupDataCache);
                }
                const result = await groupDataPhase(rawData, groupDataCache);
                if (!result) {
                    await rawDataLogic.delete(rawData._id);
                    continue;
                }

                rawData.status.isGrouped = true;
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

        documents = (await rawDataLogic.getAll(queryConditions)).documents;
    }

    script.next();
};

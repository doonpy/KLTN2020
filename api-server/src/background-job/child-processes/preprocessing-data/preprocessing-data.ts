import RawDataLogic from '@service/raw-data/RawDataLogic';
import { RawDataDocumentModel } from '@service/raw-data/interface';
import { DOCUMENT_LIMIT } from '@background-job/child-processes/preprocessing-data/constant';
import { mapPointPhase } from '@background-job/child-processes/preprocessing-data/map-point';
import { summaryPhase } from '@background-job/child-processes/preprocessing-data/summary';
import { analyticsPhase } from '@background-job/child-processes/preprocessing-data/analytics';
import {
    AggregationGroupDataResult,
    checkGroupDataSettings,
    getRepresent,
    GroupDataCache,
    groupDataPhase,
} from '@background-job/child-processes/preprocessing-data/group-data';
import { VisualMapPointDocumentModel } from '@service/visual/map-point/interface';
import { GroupedDataDocumentModel } from '@service/grouped-data/interface';
import { VisualSummaryDistrictDocumentModel } from '@service/visual/summary/district/interface';
import { VisualSummaryDistrictWardDocumentModel } from '@service/visual/summary/district-ward/interface';
import { VisualAnalyticsDocumentModel } from '@service/visual/analytics/interface';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import VisualMapPointLogic from '@service/visual/map-point/VisualMapPointLogic';
import GroupedDataLogic from '@service/grouped-data/GroupedDataLogic';
import VisualSummaryDistrictLogic from '@service/visual/summary/district/VisualSummaryDistrictLogic';
import VisualSummaryDistrictWardLogic from '@service/visual/summary/district-ward/VisualSummaryDistrictWardLogic';
import VisualAnalyticsLogic from '@service/visual/analytics/VisualAnalyticsLogic';
import _ from 'lodash';
import { DocumentModelBase } from '@service/interface';

interface StateCache {
    mapPoint?: VisualMapPointDocumentModel;
    grouped?: GroupedDataDocumentModel;
    summaryDistrict?: VisualSummaryDistrictDocumentModel;
    summaryDistrictWard?: VisualSummaryDistrictWardDocumentModel;
    analytics?: VisualAnalyticsDocumentModel;
}

export enum StateCacheProperties {
    MAP_POINT = 'mapPoint',
    GROUPED = 'grouped',
    SUMMARY_DISTRICT = 'summaryDistrict',
    SUMMARY_DISTRICT_WARD = 'summaryDistrictWard',
    ANALYTICS = 'analytics',
}

const rawDataLogic = RawDataLogic.getInstance();
const visualMapPointLogic = VisualMapPointLogic.getInstance();
const groupedDataLogic = GroupedDataLogic.getInstance();
const visualSummaryDistrictLogic = VisualSummaryDistrictLogic.getInstance();
const visualSummaryDistrictWardLogic = VisualSummaryDistrictWardLogic.getInstance();
const visualAnalyticsLogic = VisualAnalyticsLogic.getInstance();

const groupDataCacheList: GroupDataCache[] = [];
let stateCache: StateCache = {};

/**
 * Set state cache
 */
export const setStateCache = (key: string, state: DocumentModelBase): void => {
    (stateCache as Record<string, DocumentModelBase>)[key] = _.cloneDeep(state);
};

/**
 * Rollback to previous state
 */
const rollback = async (): Promise<void> => {
    const cloneStateCache = stateCache as Record<string, DocumentModelBase>;

    for (const key of Object.keys(cloneStateCache)) {
        if (cloneStateCache[key].isNew) {
            const id = cloneStateCache[key]._id;
            switch (key) {
                case StateCacheProperties.MAP_POINT:
                    await visualMapPointLogic.delete(id);
                    break;
                case StateCacheProperties.GROUPED:
                    await groupedDataLogic.delete(id);
                    break;
                case StateCacheProperties.SUMMARY_DISTRICT:
                    await visualSummaryDistrictLogic.delete(id);
                    break;
                case StateCacheProperties.SUMMARY_DISTRICT_WARD:
                    await visualSummaryDistrictWardLogic.delete(id);
                    break;
                default:
                    await visualAnalyticsLogic.delete(id);
            }
        } else if (cloneStateCache[key]) {
            await cloneStateCache[key].updateOne(cloneStateCache[key]);
        }
    }
};

/**
 * Commit to change
 */
const commit = async (rawData: RawDataDocumentModel): Promise<void> => {
    rawData.status.isMapPoint = true;
    rawData.status.isAnalytics = true;
    rawData.status.isSummary = true;
    rawData.status.isGrouped = true;
    await rawData.save();
    stateCache = {};
};

/**
 * Main logic
 */
const _preprocessingDataPhase = async (
    rawData: RawDataDocumentModel
): Promise<void> => {
    if (!rawData.status.isMapPoint && rawData.coordinateId) {
        await mapPointPhase(rawData);
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
        await groupDataPhase(rawData, groupDataCache);
    }

    if (!rawData.status.isSummary) {
        await summaryPhase(rawData);
    }

    if (!rawData.status.isAnalytics) {
        await analyticsPhase(rawData);
    }

    await commit(rawData);
};

export const preprocessingDataPhase = async (
    script: AsyncGenerator
): Promise<void> => {
    try {
        checkGroupDataSettings();
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
                try {
                    await _preprocessingDataPhase(rawData);
                } catch (error) {
                    await rollback();
                    await rawDataLogic.delete(rawData._id);
                    new ConsoleLog(
                        ConsoleConstant.Type.ERROR,
                        `Preprocessing data - Preprocessing data phase - RID: ${rawData._id} - Error: ${error.message}`
                    ).show();
                }
            }
            documents = (await rawDataLogic.getAll(queryConditions)).documents;
        }
        script.next();
    } catch (error) {
        throw new Error(
            `Preprocessing data - Preprocessing data phase - Error: ${error.message}`
        );
    }
};

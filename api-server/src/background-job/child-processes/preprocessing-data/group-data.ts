import { getSimilarRate } from '@util/helper/string';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import GroupedDataLogic from '@service/grouped-data/GroupedDataLogic';
import { RawDataDocumentModel } from '@service/raw-data/interface';
import { GroupedDataDocumentModel } from '@service/grouped-data/interface';
import {
    setStateCache,
    StateCacheProperties,
} from '@background-job/child-processes/preprocessing-data/preprocessing-data';

export interface AggregationGroupDataResult {
    _id: number;
    represent: RawDataDocumentModel;
}

export interface GroupDataCache {
    transactionType: number;
    propertyType: number;
    items: AggregationGroupDataResult[];
}

const EXPECTED_SCORE = Number(process.env.BGR_GROUP_DATA_EXPECTED_SCORE);
const ATTR_TITLE_SCORE = Number(process.env.BGR_GROUP_DATA_ATTR_TITLE_SCORE);
const ATTR_PRICE_SCORE = Number(process.env.BGR_GROUP_DATA_ATTR_PRICE_SCORE);
const ATTR_ADDRESS_SCORE = Number(
    process.env.BGR_GROUP_DATA_ATTR_ADDRESS_SCORE
);
const OVER_FITTING_SCORE = Number(
    process.env.BGR_GROUP_DATA_OVER_FITTING_SCORE
);

const groupedDataLogic = GroupedDataLogic.getInstance();

/**
 * Check settings
 */
export const checkGroupDataSettings = (): void => {
    if (isNaN(EXPECTED_SCORE)) {
        throw new Error(
            `Group data - Invalid settings (EXPECTED_SCORE: ${EXPECTED_SCORE})`
        );
    }

    if (isNaN(ATTR_TITLE_SCORE)) {
        throw new Error(
            `Group data - Invalid settings (ATTR_TITLE_SCORE: ${ATTR_TITLE_SCORE})`
        );
    }

    if (isNaN(ATTR_PRICE_SCORE)) {
        throw new Error(
            `Group data - Invalid settings (ATTR_PRICE_SCORE: ${ATTR_PRICE_SCORE})`
        );
    }

    if (isNaN(ATTR_ADDRESS_SCORE)) {
        throw new Error(
            `Group data - Invalid settings (ATTR_ADDRESS_SCORE: ${ATTR_ADDRESS_SCORE})`
        );
    }
};

/**
 * Handle when score larger than expected score
 */
const handleExpectedScore = async (
    itemId: number,
    rawDataId: number
): Promise<GroupedDataDocumentModel> => {
    await groupedDataLogic.checkExisted({ _id: itemId });
    const groupData = await groupedDataLogic.getById(itemId);
    setStateCache(StateCacheProperties.GROUPED, groupData!);
    groupData!.items.push(rawDataId);
    return groupData!.save();
};

/**
 * Get similar score between two raw data document.
 */
const getSimilarScore = (
    firstRawData: RawDataDocumentModel,
    secondRawData: RawDataDocumentModel
): number => {
    if (
        firstRawData.acreage.value !== secondRawData.acreage.value &&
        firstRawData.acreage.measureUnit === secondRawData.acreage.measureUnit
    ) {
        return 0;
    }

    if (
        firstRawData.postDate === secondRawData.postDate &&
        firstRawData.price.value === secondRawData.price.value &&
        firstRawData.price.currency === secondRawData.price.currency &&
        firstRawData.price.timeUnit === secondRawData.price.timeUnit
    ) {
        return OVER_FITTING_SCORE;
    }

    let totalPoint = 0;
    totalPoint += calculateStringAttributeScore(
        firstRawData,
        secondRawData,
        'title'
    );
    totalPoint += calculateStringAttributeScore(
        firstRawData,
        secondRawData,
        'address'
    );
    totalPoint += calculatePriceScore(firstRawData, secondRawData);

    return totalPoint;
};

/**
 * Calculate price distance score
 */
const calculatePriceScore = (
    firstTarget: RawDataDocumentModel,
    secondTarget: RawDataDocumentModel
): number => {
    const firstPriceObj = firstTarget.price;
    const secondPriceObj = secondTarget.price;

    if (!firstPriceObj.value || !secondPriceObj.value) {
        return 0;
    }

    if (firstPriceObj.currency !== secondPriceObj.currency) {
        return 0;
    }

    const differenceRate: number =
        Math.abs(firstPriceObj.value - secondPriceObj.value) /
        ((firstPriceObj.value + secondPriceObj.value) / 2);
    if (differenceRate >= 1) {
        return 0;
    }

    return (1 - differenceRate) * ATTR_PRICE_SCORE;
};

/**
 * Calculate string attribute score
 */
const calculateStringAttributeScore = (
    firstTarget: RawDataDocumentModel,
    secondTarget: RawDataDocumentModel,
    type: 'title' | 'address' | 'describe'
): number => {
    switch (type) {
        case 'title':
            return (
                getSimilarRate(firstTarget.title, secondTarget.title) *
                ATTR_TITLE_SCORE
            );
        case 'address':
            return (
                getSimilarRate(firstTarget.address, secondTarget.address) *
                ATTR_ADDRESS_SCORE
            );
        default:
            return 0;
    }
};

/**
 * Group data phase
 */
export const groupDataPhase = async (
    rawData: RawDataDocumentModel,
    groupedDataCache: GroupDataCache
): Promise<void> => {
    for (const item of groupedDataCache.items) {
        const similarScore = getSimilarScore(rawData, item.represent);

        if (similarScore >= OVER_FITTING_SCORE) {
            throw new Error(
                `Group data - GID: ${item._id} - Error: Over fitting.`
            );
        }

        if (similarScore >= EXPECTED_SCORE) {
            await handleExpectedScore(item._id, rawData._id);
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Preprocessing data - Group data -> RID: ${rawData._id} -> GID: ${item._id}`
            ).show();
            return;
        }
    }

    const newDocument = await groupedDataLogic.create(({
        items: [rawData._id],
    } as unknown) as GroupedDataDocumentModel);
    const newGroupDataCache: AggregationGroupDataResult = {
        _id: newDocument._id,
        represent: rawData,
    };

    groupedDataCache.items.push(newGroupDataCache);
    newDocument.isNew = true;
    setStateCache(StateCacheProperties.GROUPED, newDocument);
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Preprocessing data - Group data -> RID: ${rawData._id} -> GID: ${newDocument?._id}`
    ).show();
};

/**
 * Get represent of each item in grouped data
 */
export const getRepresent = async (
    transactionType: number,
    propertyType: number
): Promise<AggregationGroupDataResult[]> => {
    const aggregations = [
        {
            $lookup: {
                from: 'raw_datas',
                localField: 'items',
                foreignField: '_id',
                as: 'items',
            },
        },
        {
            $project: {
                represent: { $arrayElemAt: ['$items', 0] },
            },
        },
        {
            $match: {
                $and: [
                    {
                        'represent.transactionType': transactionType,
                    },
                    { 'represent.propertyType': propertyType },
                ],
            },
        },
    ];
    return groupedDataLogic.getWithAggregation<AggregationGroupDataResult>(
        aggregations
    );
};

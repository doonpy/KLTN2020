import { getSimilarRate } from '@util/helper/string';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import GroupedDataLogic from '@service/grouped-data/GroupedDataLogic';
import { RawDataDocumentModel } from '@service/raw-data/interface';
import { GroupedDataDocumentModel } from '@service/grouped-data/interface';

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
const checkSettings = (): void => {
    if (isNaN(EXPECTED_SCORE)) {
        throw new Error(`Invalid settings (EXPECTED_SCORE: ${EXPECTED_SCORE})`);
    }

    if (isNaN(ATTR_TITLE_SCORE)) {
        throw new Error(
            `Invalid settings (ATTR_TITLE_SCORE: ${ATTR_TITLE_SCORE})`
        );
    }

    if (isNaN(ATTR_PRICE_SCORE)) {
        throw new Error(
            `Invalid settings (ATTR_PRICE_SCORE: ${ATTR_PRICE_SCORE})`
        );
    }

    if (isNaN(ATTR_ADDRESS_SCORE)) {
        throw new Error(
            `Invalid settings (ATTR_ADDRESS_SCORE: ${ATTR_ADDRESS_SCORE})`
        );
    }
};

/**
 * Handle when score larger than expected score
 */
const handleExpectedScore = async (
    item: AggregationGroupDataResult,
    rawData: RawDataDocumentModel
): Promise<void> => {
    await groupedDataLogic.checkExisted({ _id: item._id });
    const groupData = await groupedDataLogic.getById(item._id);
    groupData!.items.push(rawData._id);
    await Promise.all([groupData!.save(), rawData.save()]);
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
): Promise<boolean> => {
    try {
        checkSettings();

        for (const item of groupedDataCache.items) {
            const similarScore = getSimilarScore(rawData, item.represent);

            if (similarScore >= OVER_FITTING_SCORE) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Preprocessing data - Group data -> RID: ${rawData._id} -> GID: ${item._id} - Error: Over fitting.`
                ).show();
                return false;
            }

            if (similarScore >= EXPECTED_SCORE) {
                await handleExpectedScore(item, rawData);
                new ConsoleLog(
                    ConsoleConstant.Type.INFO,
                    `Preprocessing data - Group data -> RID: ${rawData._id} -> GID: ${item._id}`
                ).show();
                return true;
            }
        }

        const groupedDataCreated = (
            await Promise.all([
                groupedDataLogic.create(({
                    items: [rawData._id],
                } as unknown) as GroupedDataDocumentModel),
                rawData.save(),
            ])
        )[0];
        const newGroupDataCache: AggregationGroupDataResult = {
            _id: groupedDataCreated._id,
            represent: rawData,
        };
        groupedDataCache.items.push(newGroupDataCache);
        new ConsoleLog(
            ConsoleConstant.Type.INFO,
            `Preprocessing data - Group data -> RID: ${rawData._id} -> GID: ${groupedDataCreated?._id}`
        ).show();
        return true;
    } catch (error) {
        new ConsoleLog(
            ConsoleConstant.Type.ERROR,
            `Preprocessing data - Group data -> RID: ${rawData._id} - Error: ${
                error.cause || error.message
            }`
        ).show();
        return false;
    }
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

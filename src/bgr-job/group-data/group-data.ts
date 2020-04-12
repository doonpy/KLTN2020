import { RawData } from '../../services/raw-data/raw-data.index';
import { File } from '../../util/file/file.index';
import { GroupedData } from '../../services/grouped-data/grouped-data.index';
import { convertAcreageValue, convertPriceValue } from './group-data.helper';
import StringHandler from '../../util/string-handler/string-handler';
import ConsoleLog from '../../util/console/console.log';
import { ConsoleConstant } from '../../util/console/console.constant';
import { setProcessTimeout } from '../child-process/child-process.util';
import Timeout = NodeJS.Timeout;
import GroupedDataLogic from '../../services/grouped-data/grouped-data.logic';

interface AggregationGroupDataResult {
    _id: number;
    represent: RawData.DocumentInterface;
}

export default class GroupData {
    private startTime: [number, number] | undefined;
    private logInstance: File.Log = new File.Log();
    private isRunning: boolean = false;

    private readonly EXPECTED_POINT: number = 9;
    private readonly ATTR_POINT_TITLE: number = 4;
    private readonly ATTR_POINT_PRICE: number = 1;
    private readonly ATTR_POINT_ACREAGE: number = 2;
    private readonly ATTR_POINT_ADDRESS: number = 3;

    constructor() {
        this.logInstance.initLogFolder('group-data');
        this.logInstance.createFileName();
    }

    /**
     * Start
     */
    public async start(): Promise<void> {
        this.startTime = process.hrtime();
        this.isRunning = true;
        try {
            const rawDataLogic: RawData.Logic = new RawData.Logic();
            const groupedDataLogic: GroupedData.Logic = new GroupedData.Logic();
            const limit: number = 1000;
            let offset: number = 0;
            let queryResult: {
                rawDataset: Array<RawData.DocumentInterface>;
                hasNext: boolean;
            } = await rawDataLogic.getAll({ isGrouped: false }, true, limit, offset);
            let processTimeout: Timeout = setProcessTimeout('group data', 60 * queryResult.rawDataset.length);

            while (queryResult.hasNext && queryResult.rawDataset.length > 0) {
                let rawDataset: Array<RawData.DocumentInterface> = queryResult.rawDataset;
                rawDataLoop: for (const rawData of rawDataset) {
                    rawData.isGrouped = true;
                    let aggregations: Array<object> = [
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
                                represent: {
                                    $arrayElemAt: ['$items', 0],
                                },
                            },
                        },
                        {
                            $match: {
                                $and: [
                                    {
                                        'represent.transactionType': rawData.transactionType,
                                    },
                                    {
                                        'represent.propertyType': rawData.propertyType,
                                    },
                                ],
                            },
                        },
                    ];
                    let queryResult: Array<AggregationGroupDataResult> = await GroupedDataLogic.aggregationQuery(
                        aggregations
                    );
                    for (const result of queryResult) {
                        if (this.isBelongGroupData(rawData, result.represent)) {
                            const groupData: GroupedData.DocumentInterface | null = await groupedDataLogic.getById(
                                result._id
                            );
                            if (groupData) {
                                groupData.items.push(rawData._id);
                                await groupedDataLogic.update(result._id, groupData);
                                await rawDataLogic.update(rawData._id, rawData);
                                new ConsoleLog(
                                    ConsoleConstant.Type.INFO,
                                    `Group data - RID: ${rawData._id} -> GID: ${result._id}`
                                ).show();
                            }
                            continue rawDataLoop;
                        }
                    }
                    const groupedDataCreated = await groupedDataLogic.create([rawData._id]);
                    await rawDataLogic.update(rawData._id, rawData);
                    new ConsoleLog(
                        ConsoleConstant.Type.INFO,
                        `Group data - RID: ${rawData._id} -> GID: ${groupedDataCreated._id}`
                    ).show();
                }
                offset += limit;
                queryResult = await rawDataLogic.getAll({ isGrouped: false }, true, limit, offset);
                clearTimeout(processTimeout);
                processTimeout = setProcessTimeout('group data', 60 * queryResult.rawDataset.length);
            }
        } catch (error) {
            this.isRunning = false;
            throw error;
        }
    }

    /**
     * Check whether raw data belong any group data
     * @param {RawData.DocumentInterface} rawData
     * @param {RawData.DocumentInterface} representGroupedData
     */
    private isBelongGroupData(
        rawData: RawData.DocumentInterface,
        representGroupedData: RawData.DocumentInterface
    ): boolean {
        let totalPoint: number = 0;

        totalPoint += this.calculateStringAttributePoint(representGroupedData, rawData, 'title');
        if (totalPoint > this.EXPECTED_POINT) {
            return true;
        }

        totalPoint += this.calculateStringAttributePoint(representGroupedData, rawData, 'address');
        if (totalPoint > this.EXPECTED_POINT) {
            return true;
        }

        totalPoint += this.calculateAcreagePoint(representGroupedData, rawData);
        if (totalPoint > this.EXPECTED_POINT) {
            return true;
        }

        totalPoint += this.calculatePricePoint(representGroupedData, rawData);
        if (totalPoint > this.EXPECTED_POINT) {
            return true;
        }

        return false;
    }

    /**
     * Calculate acreage distance point
     * @param {RawData.DocumentInterface} firstTarget
     * @param {RawData.DocumentInterface} secondTarget
     * @return {number} points
     */
    private calculateAcreagePoint(
        firstTarget: RawData.DocumentInterface,
        secondTarget: RawData.DocumentInterface
    ): number {
        if (!Number(firstTarget.acreage.value) && !Number(secondTarget.acreage.value)) {
            return this.ATTR_POINT_ACREAGE;
        }

        if (!Number(firstTarget.acreage.value) || !Number(secondTarget.acreage.value)) {
            return 0;
        }

        let firstAcreageObj: { value: number; measureUnit: string } = {
            value: Number(firstTarget.acreage.value),
            measureUnit: firstTarget.acreage.measureUnit,
        };
        let secondAcreageObj: { value: number; measureUnit: string } = {
            value: Number(secondTarget.acreage.value),
            measureUnit: secondTarget.acreage.measureUnit,
        };

        if (firstAcreageObj.measureUnit !== secondAcreageObj.measureUnit) {
            if (firstAcreageObj.measureUnit === 'km²') {
                firstAcreageObj.value = convertAcreageValue(firstAcreageObj.value, 'km²', 'm²');
            }

            if (secondAcreageObj.measureUnit === 'km²') {
                secondAcreageObj.value = convertAcreageValue(secondAcreageObj.value, 'km²', 'm²');
            }
        }

        return (
            (1 -
                Math.abs(firstAcreageObj.value - secondAcreageObj.value) /
                    ((firstAcreageObj.value + secondAcreageObj.value) / 2)) *
            this.ATTR_POINT_ACREAGE
        );
    }

    /**
     * Calculate price distance point
     * @param {RawData.DocumentInterface} firstTarget
     * @param {RawData.DocumentInterface} secondTarget
     * @return {number} points
     */
    private calculatePricePoint(
        firstTarget: RawData.DocumentInterface,
        secondTarget: RawData.DocumentInterface
    ): number {
        if (!Number(firstTarget.price.value) && !Number(secondTarget.price.value)) {
            return this.ATTR_POINT_PRICE;
        }

        if (!Number(firstTarget.price.value) || !Number(secondTarget.price.value)) {
            return 0;
        }

        let firstPriceObj: { value: number; currency: string } = {
            value: Number(firstTarget.price.value),
            currency: firstTarget.price.currency,
        };
        let secondPriceObj: { value: number; currency: string } = {
            value: Number(secondTarget.price.value),
            currency: secondTarget.price.currency,
        };

        if (firstPriceObj.currency !== secondPriceObj.currency) {
            firstPriceObj.value = convertPriceValue(firstPriceObj.value, firstPriceObj.currency, 'nghìn');
            secondPriceObj.value = convertPriceValue(secondPriceObj.value, secondPriceObj.currency, 'nghìn');
        }

        return (
            (1 -
                Math.abs(firstPriceObj.value - secondPriceObj.value) /
                    ((firstPriceObj.value + secondPriceObj.value) / 2)) *
            this.ATTR_POINT_PRICE
        );
    }

    /**
     * Calculate string attribute point
     * @param {RawData.DocumentInterface} firstTarget
     * @param {RawData.DocumentInterface} secondTarget
     * @param {'title'|'address'} type
     * @return {number} points
     */
    private calculateStringAttributePoint(
        firstTarget: RawData.DocumentInterface,
        secondTarget: RawData.DocumentInterface,
        type: 'title' | 'address'
    ): number {
        let attrPoint: number = 0;
        let firstString: string = '';
        let secondString: string = '';
        switch (type) {
            case 'address':
                attrPoint = this.ATTR_POINT_ADDRESS;
                firstString = firstTarget.address;
                secondString = secondTarget.address;
                break;
            case 'title':
                attrPoint = this.ATTR_POINT_TITLE;
                firstString = firstTarget.title;
                secondString = secondTarget.title;
                break;
        }

        if (!firstString || !secondString) {
            return 0;
        }

        return StringHandler.getSimilarRate(firstString, secondString) * attrPoint;
    }
}

import RawData from '../../services/raw-data/raw-data.index';
import File from '../../util/file/file.index';
import GroupedData from '../../services/grouped-data/grouped-data.index';
import { convertAcreageValue, convertPriceValue } from './group-data.helper';
import StringHandler from '../../util/string-handler/string-handler';
import ConsoleLog from '../../util/console/console.log';
import ConsoleConstant from '../../util/console/console.constant';
import GroupedDataLogic from '../../services/grouped-data/grouped-data.logic';
import RawDataModelInterface from '../../services/raw-data/raw-data.model.interface';
import FileLog from '../../util/file/file.log';
import RawDataLogic from '../../services/raw-data/raw-data.logic';
import GroupedDataModelInterface from '../../services/grouped-data/grouped-data.model.interface';

interface AggregationGroupDataResult {
    _id: number;
    represent: RawDataModelInterface;
}

export default class GroupData {
    private startTime: [number, number] | undefined;

    private logInstance: FileLog = new File.Log();

    private isRunning = false;

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
            const rawDataLogic: RawDataLogic = new RawData.Logic();
            const groupedDataLogic: GroupedDataLogic = new GroupedData.Logic();
            const limit = 1000;
            let offset = 0;
            let queryResult: {
                rawDataset: RawDataModelInterface[];
                hasNext: boolean;
            } = await rawDataLogic.getAll({ isGrouped: false }, true, limit, offset);

            while (queryResult.hasNext || queryResult.rawDataset.length > 0) {
                const { rawDataset } = queryResult;
                rawDataLoop: for (const rawData of rawDataset) {
                    rawData.isGrouped = true;
                    const aggregations: object[] = [
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
                    const results: AggregationGroupDataResult[] = await GroupedDataLogic.aggregationQuery(aggregations);
                    for (const result of results) {
                        if (this.isBelongGroupData(rawData, result.represent)) {
                            const groupData: GroupedDataModelInterface | null = await groupedDataLogic.getById(
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
            }
        } catch (error) {
            this.isRunning = false;
            throw error;
        }
    }

    /**
     * Check whether raw data belong any group data
     * @param {RawDataModelInterface} rawData
     * @param {RawDataModelInterface} representGroupedData
     */
    private isBelongGroupData(rawData: RawDataModelInterface, representGroupedData: RawDataModelInterface): boolean {
        let totalPoint = 0;

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
     * @param {RawDataModelInterface} firstTarget
     * @param {RawDataModelInterface} secondTarget
     * @return {number} points
     */
    private calculateAcreagePoint(firstTarget: RawDataModelInterface, secondTarget: RawDataModelInterface): number {
        if (!Number(firstTarget.acreage.value) && !Number(secondTarget.acreage.value)) {
            return this.ATTR_POINT_ACREAGE;
        }

        if (!Number(firstTarget.acreage.value) || !Number(secondTarget.acreage.value)) {
            return 0;
        }

        const firstAcreageObj: { value: number; measureUnit: string } = {
            value: Number(firstTarget.acreage.value),
            measureUnit: firstTarget.acreage.measureUnit,
        };
        const secondAcreageObj: { value: number; measureUnit: string } = {
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
     * @param {RawDataModelInterface} firstTarget
     * @param {RawDataModelInterface} secondTarget
     * @return {number} points
     */
    private calculatePricePoint(firstTarget: RawDataModelInterface, secondTarget: RawDataModelInterface): number {
        if (!Number(firstTarget.price.value) && !Number(secondTarget.price.value)) {
            return this.ATTR_POINT_PRICE;
        }

        if (!Number(firstTarget.price.value) || !Number(secondTarget.price.value)) {
            return 0;
        }

        const firstPriceObj: { value: number; currency: string } = {
            value: Number(firstTarget.price.value),
            currency: firstTarget.price.currency,
        };
        const secondPriceObj: { value: number; currency: string } = {
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
     * @param {RawDataModelInterface} firstTarget
     * @param {RawDataModelInterface} secondTarget
     * @param {'title'|'address'} type
     * @return {number} points
     */
    private calculateStringAttributePoint(
        firstTarget: RawDataModelInterface,
        secondTarget: RawDataModelInterface,
        type: 'title' | 'address'
    ): number {
        let attrPoint = 0;
        let firstString = '';
        let secondString = '';
        if (type === 'address') {
            attrPoint = this.ATTR_POINT_ADDRESS;
            firstString = firstTarget.address;
            secondString = secondTarget.address;
        } else {
            attrPoint = this.ATTR_POINT_TITLE;
            firstString = firstTarget.title;
            secondString = secondTarget.title;
        }

        if (!firstString || !secondString) {
            return 0;
        }

        return StringHandler.getSimilarRate(firstString, secondString) * attrPoint;
    }
}

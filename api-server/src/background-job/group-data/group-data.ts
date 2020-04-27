import File from '../../util/file/file.index';
import { convertAcreageValue, convertPriceValue } from './group-data.helper';
import StringHandler from '../../util/helper/string-handler';
import ConsoleLog from '../../util/console/console.log';
import ConsoleConstant from '../../util/console/console.constant';
import GroupedDataLogic from '../../service/grouped-data/grouped-data.logic';
import FileLog from '../../util/file/file.log';
import RawDataLogic from '../../service/raw-data/raw-data.logic';
import ChatBotTelegram from '../../util/chatbot/chatBotTelegram';
import { RawDataDocumentModel } from '../../service/raw-data/raw-data.interface';
import { GroupedDataDocumentModel } from '../../service/grouped-data/grouped-data.interface';

interface AggregationGroupDataResult {
    _id: number;
    represent: RawDataDocumentModel;
}

export default class GroupData {
    private startTime: [number, number] | undefined;

    private logInstance: FileLog = new File.Log();

    private isRunning = false;

    private rawDataLogic: RawDataLogic = RawDataLogic.getInstance();

    private groupedDataLogic: GroupedDataLogic = GroupedDataLogic.getInstance();

    private readonly EXPECTED_POINT: number = 9;

    private readonly ATTR_POINT_TITLE: number = 4;

    private readonly ATTR_POINT_DESCRIBE: number = 1;

    private readonly ATTR_POINT_PRICE: number = 1;

    private readonly ATTR_POINT_ACREAGE: number = 2;

    private readonly ATTR_POINT_ADDRESS: number = 2;

    constructor() {
        this.logInstance.initLogFolder('group-data');
        this.logInstance.createFileName();
    }

    /**
     * Start
     */
    public async start(transactionType: number): Promise<void> {
        this.startTime = process.hrtime();
        this.isRunning = true;
        try {
            const limit = 1000;
            let offset = 0;
            let rawDataset: {
                documents: RawDataDocumentModel[];
                hasNext: boolean;
            } = await this.rawDataLogic.getAll(limit, offset, { isGrouped: false, transactionType });

            while (rawDataset.hasNext || rawDataset.documents.length > 0) {
                const { documents } = rawDataset;
                rawDataLoop: for (const document of documents) {
                    document.isGrouped = true;
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
                                'represent.transactionType': document.transactionType,
                            },
                        },
                    ];
                    const representOfGroupedDataset: AggregationGroupDataResult[] = ((await this.groupedDataLogic.aggregationQuery(
                        aggregations
                    )) as unknown) as AggregationGroupDataResult[];
                    for (const item of representOfGroupedDataset) {
                        if (this.isBelongGroupData(document, item.represent)) {
                            const groupData: GroupedDataDocumentModel = await this.groupedDataLogic.getById(item._id);

                            groupData.items.push(document._id);
                            try {
                                await Promise.all([
                                    this.groupedDataLogic.update(item._id, groupData),
                                    this.rawDataLogic.update(document._id, document),
                                ]);
                                new ConsoleLog(
                                    ConsoleConstant.Type.INFO,
                                    `Group data - RID: ${document._id} -> GID: ${item._id}`
                                ).show();
                            } catch (error) {
                                await ChatBotTelegram.getInstance().sendMessage(
                                    `Error:\n<code>${error.cause || error.message}</code>`
                                );
                                new ConsoleLog(
                                    ConsoleConstant.Type.ERROR,
                                    `Group data - RID: ${document._id} -> GID: ${item._id} - Error: ${
                                        error.cause || error.message
                                    }`
                                ).show();
                            }

                            continue rawDataLoop;
                        }
                    }

                    const groupedDataCreated: GroupedDataDocumentModel | undefined = (
                        await Promise.all([
                            this.groupedDataLogic.create(([document._id] as unknown) as GroupedDataDocumentModel),
                            this.rawDataLogic.update(document._id, document),
                        ])
                    )[0];

                    new ConsoleLog(
                        ConsoleConstant.Type.INFO,
                        `Group data - RID: ${document._id} -> GID: ${groupedDataCreated?._id}`
                    ).show();
                }
                offset += limit;
                rawDataset = await this.rawDataLogic.getAll(limit, offset, { isGrouped: false });
            }
        } catch (error) {
            this.isRunning = false;
        }
    }

    /**
     * Check whether raw data belong any group data
     * @param {RawDataDocumentModel} rawData
     * @param {RawDataDocumentModel} representGroupedData
     */
    private isBelongGroupData(rawData: RawDataDocumentModel, representGroupedData: RawDataDocumentModel): boolean {
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

        totalPoint += this.calculateStringAttributePoint(representGroupedData, rawData, 'describe');
        if (totalPoint > this.EXPECTED_POINT) {
            return true;
        }

        totalPoint += this.calculatePricePoint(representGroupedData, rawData);
        return totalPoint > this.EXPECTED_POINT;
    }

    /**
     * Calculate acreage distance point
     * @param {RawDataDocumentModel} firstTarget
     * @param {RawDataDocumentModel} secondTarget
     * @return {number} points
     */
    private calculateAcreagePoint(firstTarget: RawDataDocumentModel, secondTarget: RawDataDocumentModel): number {
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
     * @param {RawDataDocumentModel} firstTarget
     * @param {RawDataDocumentModel} secondTarget
     * @return {number} points
     */
    private calculatePricePoint(firstTarget: RawDataDocumentModel, secondTarget: RawDataDocumentModel): number {
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
     * @param {RawDataDocumentModel} firstTarget
     * @param {RawDataDocumentModel} secondTarget
     * @param {'title' | 'address' | 'describe'} type
     * @return {number} points
     */
    private calculateStringAttributePoint(
        firstTarget: RawDataDocumentModel,
        secondTarget: RawDataDocumentModel,
        type: 'title' | 'address' | 'describe'
    ): number {
        switch (type) {
            case 'title':
                return StringHandler.getSimilarRate(firstTarget.title, secondTarget.title) * this.ATTR_POINT_TITLE;
            case 'describe':
                return (
                    StringHandler.getSimilarRate(firstTarget.describe, secondTarget.describe) * this.ATTR_POINT_DESCRIBE
                );
            case 'address':
                return (
                    StringHandler.getSimilarRate(firstTarget.address, secondTarget.address) * this.ATTR_POINT_ADDRESS
                );
            default:
                return 0;
        }
    }
}

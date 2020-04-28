import { convertAcreageValue, convertPriceValue } from './group-data.helper';
import StringHandler from '../../util/helper/string-handler';
import ConsoleLog from '../../util/console/console.log';
import ConsoleConstant from '../../util/console/console.constant';
import GroupedDataLogic from '../../service/grouped-data/grouped-data.logic';
import RawDataLogic from '../../service/raw-data/raw-data.logic';
import ChatBotTelegram from '../../util/chatbot/chatBotTelegram';
import { RawDataDocumentModel } from '../../service/raw-data/raw-data.interface';
import { GroupedDataDocumentModel } from '../../service/grouped-data/grouped-data.interface';
import RawDataConstant from '../../service/raw-data/raw-data.constant';

interface AggregationGroupDataResult {
    _id: number;
    represent: RawDataDocumentModel;
}

export default class GroupData {
    private isRunning = false;

    private rawDataLogic: RawDataLogic = RawDataLogic.getInstance();

    private groupedDataLogic: GroupedDataLogic = GroupedDataLogic.getInstance();

    private readonly EXPECTED_SCORE: number = 9;

    private readonly ATTR_TITLE_SCORE: number = 4;

    private readonly ATTR_DESCRIBE_SCORE: number = 1;

    private readonly ATTR_PRICE_SCORE: number = 1;

    private readonly ATTR_ACREAGE_SCORE: number = 2;

    private readonly ATTR_ADDRESS_SCORE: number = 2;

    private readonly TOTAL_SCORE: number;

    constructor() {
        this.TOTAL_SCORE =
            this.ATTR_TITLE_SCORE +
            this.ATTR_DESCRIBE_SCORE +
            this.ATTR_ACREAGE_SCORE +
            this.ATTR_ADDRESS_SCORE +
            this.ATTR_PRICE_SCORE;
    }

    /**
     * Start
     */
    public async start(transactionType: number, propertyType: number): Promise<void> {
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
                                represent: { $arrayElemAt: ['$items', 0] },
                            },
                        },
                        {
                            $match: {
                                $and: [
                                    { 'represent.transactionType': transactionType },
                                    {
                                        $or: [
                                            { 'represent.propertyType': propertyType },
                                            { 'represent.propertyType': RawDataConstant.PROPERTY_TYPE[12].id },
                                        ],
                                    },
                                ],
                            },
                        },
                    ];
                    const representOfGroupedDataset: AggregationGroupDataResult[] = ((await this.groupedDataLogic.aggregationQuery(
                        aggregations
                    )) as unknown) as AggregationGroupDataResult[];
                    for (const item of representOfGroupedDataset) {
                        const similarScore: number = this.getSimilarScore(document, item.represent);

                        if (similarScore === this.TOTAL_SCORE) {
                            await this.rawDataLogic.delete(document._id);
                            new ConsoleLog(
                                ConsoleConstant.Type.ERROR,
                                `Group data -> RID: ${document._id} -> GID: ${item._id} - Error: Over fitting.`
                            ).show();
                            continue rawDataLoop;
                        }

                        if (similarScore >= this.EXPECTED_SCORE) {
                            const groupData: GroupedDataDocumentModel = await this.groupedDataLogic.getById(item._id);

                            groupData.items.push(document._id);
                            try {
                                await Promise.all([
                                    this.groupedDataLogic.update(item._id, groupData),
                                    this.rawDataLogic.update(document._id, document),
                                ]);
                                new ConsoleLog(
                                    ConsoleConstant.Type.INFO,
                                    `Group data -> RID: ${document._id} -> GID: ${item._id}`
                                ).show();
                            } catch (error) {
                                await ChatBotTelegram.getInstance().sendMessage(
                                    `Error:\n<code>${error.cause || error.message}</code>`
                                );
                                new ConsoleLog(
                                    ConsoleConstant.Type.ERROR,
                                    `Group data -> RID: ${document._id} -> GID: ${item._id} - Error: ${
                                        error.cause || error.message
                                    }`
                                ).show();
                            }

                            continue rawDataLoop;
                        }
                    }

                    const groupedDataCreated: GroupedDataDocumentModel | undefined = (
                        await Promise.all([
                            this.groupedDataLogic.create(({
                                items: [document._id],
                            } as unknown) as GroupedDataDocumentModel),
                            this.rawDataLogic.update(document._id, document),
                        ])
                    )[0];

                    new ConsoleLog(
                        ConsoleConstant.Type.INFO,
                        `Group data -> RID: ${document._id} -> GID: ${groupedDataCreated?._id}`
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
     * Get similar score between two raw data document.
     *
     * @param {RawDataDocumentModel} firstRawData
     * @param {RawDataDocumentModel} secondRawData
     *
     * @return {number} totalPoint
     */
    private getSimilarScore(firstRawData: RawDataDocumentModel, secondRawData: RawDataDocumentModel): number {
        let totalPoint = 0;
        totalPoint += this.calculateStringAttributeScore(firstRawData, secondRawData, 'title');
        totalPoint += this.calculateStringAttributeScore(firstRawData, secondRawData, 'address');
        totalPoint += this.calculateStringAttributeScore(firstRawData, secondRawData, 'describe');
        totalPoint += this.calculatePriceScore(firstRawData, secondRawData);
        totalPoint += this.calculateAcreageScore(firstRawData, secondRawData);

        return totalPoint;
    }

    /**
     * Calculate acreage distance score
     *
     * @param {RawDataDocumentModel} firstTarget
     * @param {RawDataDocumentModel} secondTarget
     *
     * @return {number} points
     */
    private calculateAcreageScore(firstTarget: RawDataDocumentModel, secondTarget: RawDataDocumentModel): number {
        if (!Number(firstTarget.acreage.value) && !Number(secondTarget.acreage.value)) {
            return this.ATTR_ACREAGE_SCORE;
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
            this.ATTR_ACREAGE_SCORE
        );
    }

    /**
     * Calculate price distance score
     *
     * @param {RawDataDocumentModel} firstTarget
     * @param {RawDataDocumentModel} secondTarget
     *
     * @return {number} points
     */
    private calculatePriceScore(firstTarget: RawDataDocumentModel, secondTarget: RawDataDocumentModel): number {
        if (!Number(firstTarget.price.value) && !Number(secondTarget.price.value)) {
            return this.ATTR_PRICE_SCORE;
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
            this.ATTR_PRICE_SCORE
        );
    }

    /**
     * Calculate string attribute score
     *
     * @param {RawDataDocumentModel} firstTarget
     * @param {RawDataDocumentModel} secondTarget
     * @param {'title' | 'address' | 'describe'} type
     *
     * @return {number} points
     */
    private calculateStringAttributeScore(
        firstTarget: RawDataDocumentModel,
        secondTarget: RawDataDocumentModel,
        type: 'title' | 'address' | 'describe'
    ): number {
        switch (type) {
            case 'title':
                return StringHandler.getSimilarRate(firstTarget.title, secondTarget.title) * this.ATTR_TITLE_SCORE;
            case 'describe':
                return (
                    StringHandler.getSimilarRate(firstTarget.describe, secondTarget.describe) * this.ATTR_DESCRIBE_SCORE
                );
            case 'address':
                return (
                    StringHandler.getSimilarRate(firstTarget.address, secondTarget.address) * this.ATTR_ADDRESS_SCORE
                );
            default:
                return 0;
        }
    }
}

import { getSimilarRate } from '@util/helper/string';
import ConsoleLog from '@util/console/console.log';
import ConsoleConstant from '@util/console/console.constant';
import GroupedDataLogic from '@service/grouped-data/grouped-data.logic';
import RawDataLogic from '@service/raw-data/raw-data.logic';
import ChatBotTelegram from '@util/chatbot/chatBotTelegram';
import { RawDataDocumentModel } from '@service/raw-data/raw-data.interface';
import { GroupedDataDocumentModel } from '@service/grouped-data/grouped-data.interface';
import { convertTotalSecondsToTime } from '@util/helper/datetime';

interface AggregationGroupDataResult {
    _id: number;
    represent: RawDataDocumentModel;
}

export default class GroupData {
    private isSuspense = false;

    private rawDataLogic = RawDataLogic.getInstance();

    private groupedDataLogic = GroupedDataLogic.getInstance();

    private readonly EXPECTED_SCORE = 8;

    private readonly ATTR_TITLE_SCORE = 4;

    private readonly ATTR_PRICE_SCORE = 3;

    private readonly ATTR_ADDRESS_SCORE = 3;

    private readonly OVER_FITTING_SCORE = 9;

    /**
     * Start
     */
    public async start(
        transactionType: number,
        propertyType: number
    ): Promise<void> {
        const startTime = process.hrtime();
        const limit = 1000;
        let isCompareDone = true;
        let rawDataset = await this.rawDataLogic.getAll({
            limit,
            conditions: {
                isGrouped: false,
                transactionType,
                propertyType,
            },
        });

        const loop = setInterval(async (): Promise<void> => {
            if (this.isSuspense || !isCompareDone) {
                return;
            }

            if (!rawDataset.hasNext && rawDataset.documents.length === 0) {
                clearInterval(loop);
                const executeTime = convertTotalSecondsToTime(
                    process.hrtime(startTime)[0]
                );
                await ChatBotTelegram.getInstance().sendMessage(
                    `<b>🤖[Group data]🤖</b>\n✅Group data complete - TID: ${transactionType} - PID: ${propertyType} - Execute time: ${executeTime}`
                );
                new ConsoleLog(
                    ConsoleConstant.Type.INFO,
                    `Group data - TID: ${transactionType} - PID: ${propertyType} - Execute time: ${executeTime} - Complete`
                ).show();
                process.exit(0);
            }

            isCompareDone = false;
            const { documents } = rawDataset;
            rawDataLoop: for (const document of documents) {
                document.isGrouped = true;
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
                const representOfGroupedDataset = await this.groupedDataLogic.getWithAggregation<
                    AggregationGroupDataResult
                >(aggregations);

                for (const item of representOfGroupedDataset) {
                    const similarScore = this.getSimilarScore(
                        document,
                        item.represent
                    );

                    if (similarScore >= this.OVER_FITTING_SCORE) {
                        new ConsoleLog(
                            ConsoleConstant.Type.ERROR,
                            `Group data -> RID: ${document._id} -> GID: ${item._id} - Error: Over fitting.`
                        ).show();
                        await this.rawDataLogic.update(document._id, document);
                        continue rawDataLoop;
                    }

                    if (similarScore >= this.EXPECTED_SCORE) {
                        const groupData = await this.groupedDataLogic.getById(
                            item._id
                        );

                        groupData.items.push(document._id);
                        try {
                            await Promise.all([
                                this.groupedDataLogic.update(
                                    item._id,
                                    groupData
                                ),
                                this.rawDataLogic.update(
                                    document._id,
                                    document
                                ),
                            ]);
                            new ConsoleLog(
                                ConsoleConstant.Type.INFO,
                                `Group data -> RID: ${document._id} -> GID: ${item._id}`
                            ).show();
                        } catch (error) {
                            await ChatBotTelegram.getInstance().sendMessage(
                                `Error:\n<code>${
                                    error.cause || error.message
                                }</code>`
                            );
                            new ConsoleLog(
                                ConsoleConstant.Type.ERROR,
                                `Group data -> RID: ${document._id} -> GID: ${
                                    item._id
                                } - Error: ${error.cause || error.message}`
                            ).show();
                        }

                        continue rawDataLoop;
                    }
                }

                const groupedDataCreated = (
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
            rawDataset = await this.rawDataLogic.getAll({
                limit,
                conditions: {
                    isGrouped: false,
                    transactionType,
                    propertyType,
                },
            });
            isCompareDone = true;
        }, 0);
    }

    /**
     * Suspense process
     */
    public suspense(): void {
        this.isSuspense = true;
    }

    /**
     * Continue process
     */
    public continue(): void {
        this.isSuspense = false;
    }

    /**
     * @return {boolean}
     */
    public isProcessSuspense(): boolean {
        return this.isSuspense;
    }

    /**
     * Get similar score between two raw data document.
     *
     * @param {RawDataDocumentModel} firstRawData
     * @param {RawDataDocumentModel} secondRawData
     *
     * @return {number} totalPoint
     */
    private getSimilarScore(
        firstRawData: RawDataDocumentModel,
        secondRawData: RawDataDocumentModel
    ): number {
        if (
            firstRawData.acreage.value !== secondRawData.acreage.value &&
            firstRawData.acreage.measureUnit ===
                secondRawData.acreage.measureUnit
        ) {
            return 0;
        }

        if (
            firstRawData.postDate === secondRawData.postDate &&
            firstRawData.price.value === secondRawData.price.value &&
            firstRawData.price.currency === secondRawData.price.currency &&
            firstRawData.price.timeUnit === secondRawData.price.timeUnit
        ) {
            return this.OVER_FITTING_SCORE;
        }

        let totalPoint = 0;
        totalPoint += this.calculateStringAttributeScore(
            firstRawData,
            secondRawData,
            'title'
        );
        totalPoint += this.calculateStringAttributeScore(
            firstRawData,
            secondRawData,
            'address'
        );
        totalPoint += this.calculatePriceScore(firstRawData, secondRawData);

        return totalPoint;
    }

    /**
     * Calculate price distance score
     *
     * @param {RawDataDocumentModel} firstTarget
     * @param {RawDataDocumentModel} secondTarget
     *
     * @return {number} points
     */
    private calculatePriceScore(
        firstTarget: RawDataDocumentModel,
        secondTarget: RawDataDocumentModel
    ): number {
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

        return (1 - differenceRate) * this.ATTR_PRICE_SCORE;
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
                return (
                    getSimilarRate(firstTarget.title, secondTarget.title) *
                    this.ATTR_TITLE_SCORE
                );
            case 'address':
                return (
                    getSimilarRate(firstTarget.address, secondTarget.address) *
                    this.ATTR_ADDRESS_SCORE
                );
            default:
                return 0;
        }
    }
}

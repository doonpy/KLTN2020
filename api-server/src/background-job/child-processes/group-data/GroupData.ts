import { getSimilarRate } from '@util/helper/string';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import GroupedDataLogic from '@service/grouped-data/GroupedDataLogic';
import RawDataLogic from '@service/raw-data/RawDataLogic';
import ChatBotTelegram from '@util/chatbot/ChatBotTelegram';
import { RawDataDocumentModel } from '@service/raw-data/interface';
import { GroupedDataDocumentModel } from '@service/grouped-data/interface';
import { convertTotalSecondsToTime } from '@util/helper/datetime';

interface AggregationGroupDataResult {
    _id: number;
    represent: RawDataDocumentModel;
}

const EXPECTED_SCORE = Number(process.env.BGR_GROUP_DATA_EXPECTED_SCORE || '8');
const ATTR_TITLE_SCORE = Number(
    process.env.BGR_GROUP_DATA_ATTR_TITLE_SCORE || '4'
);
const ATTR_PRICE_SCORE = Number(
    process.env.BGR_GROUP_DATA_ATTR_PRICE_SCORE || '3'
);
const ATTR_ADDRESS_SCORE = Number(
    process.env.BGR_GROUP_DATA_ATTR_ADDRESS_SCORE || '3'
);
const OVER_FITTING_SCORE = Number(
    process.env.BGR_GROUP_DATA_OVER_FITTING_SCORE || '9'
);
enum FinishActionType {
    COMPLETE = 1,
    SUSPEND,
}

export default class GroupData {
    private isSuspense = false;

    private rawDataLogic = RawDataLogic.getInstance();

    private groupedDataLogic = GroupedDataLogic.getInstance();

    /**
     * Start
     */
    public async start(
        transactionType: number,
        propertyType: number
    ): Promise<void> {
        const startTime: [number, number] = process.hrtime();
        const rawDataset = await this.rawDataLogic.getAll({
            conditions: {
                'status.isGrouped': false,
                transactionType,
                propertyType,
            },
        });
        const representOfGroupedDataset = await this.getRepresent(
            transactionType,
            propertyType
        );
        rawDataLoop: for (const rawData of rawDataset.documents) {
            if (this.isSuspense) {
                await this.finishAction(
                    startTime,
                    transactionType,
                    propertyType,
                    FinishActionType.SUSPEND
                );
                return;
            }
            rawData.status.isGrouped = true;

            for (const item of representOfGroupedDataset) {
                const similarScore = this.getSimilarScore(
                    rawData,
                    item.represent
                );

                if (similarScore >= OVER_FITTING_SCORE) {
                    new ConsoleLog(
                        ConsoleConstant.Type.ERROR,
                        `Group data -> RID: ${rawData._id} -> GID: ${item._id} - Error: Over fitting.`
                    ).show();
                    await rawData.save();
                    continue rawDataLoop;
                }

                if (similarScore >= EXPECTED_SCORE) {
                    const groupData = await this.groupedDataLogic.getById(
                        item._id
                    );

                    groupData.items.push(rawData._id);
                    try {
                        await Promise.all([groupData.save(), rawData.save()]);
                        new ConsoleLog(
                            ConsoleConstant.Type.INFO,
                            `Group data -> RID: ${rawData._id} -> GID: ${item._id}`
                        ).show();
                    } catch (error) {
                        await ChatBotTelegram.getInstance().sendMessage(
                            `Error:\n<code>${
                                error.cause || error.message
                            }</code>`
                        );
                        new ConsoleLog(
                            ConsoleConstant.Type.ERROR,
                            `Group data -> RID: ${rawData._id} -> GID: ${
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
                        items: [rawData._id],
                    } as unknown) as GroupedDataDocumentModel),
                    rawData.save(),
                ])
            )[0];
            const newRepresent: AggregationGroupDataResult = {
                _id: groupedDataCreated._id,
                represent: rawData,
            };
            representOfGroupedDataset.push(newRepresent);

            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Group data -> RID: ${rawData._id} -> GID: ${groupedDataCreated?._id}`
            ).show();
        }

        await this.finishAction(
            startTime,
            transactionType,
            propertyType,
            FinishActionType.COMPLETE
        );
    }

    /**
     * Get represent of each item in grouped data
     */
    private async getRepresent(
        transactionType: number,
        propertyType: number
    ): Promise<AggregationGroupDataResult[]> {
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
        return this.groupedDataLogic.getWithAggregation<
            AggregationGroupDataResult
        >(aggregations);
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

    public isProcessSuspense(): boolean {
        return this.isSuspense;
    }

    /**
     * Get similar score between two raw data document.
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
            return OVER_FITTING_SCORE;
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

        return (1 - differenceRate) * ATTR_PRICE_SCORE;
    }

    /**
     * Calculate string attribute score
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
    }

    private async finishAction(
        startTime: [number, number],
        transactionType: number,
        propertyType: number,
        type: FinishActionType
    ): Promise<void> {
        const executeTime = convertTotalSecondsToTime(
            process.hrtime(startTime)[0]
        );
        if (type === FinishActionType.COMPLETE) {
            await ChatBotTelegram.getInstance().sendMessage(
                `<b>🤖[Group data]🤖</b>\n✅Group data complete - TID: ${transactionType} - PID: ${propertyType} - Execute time: ${executeTime}`
            );
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Group data - TID: ${transactionType} - PID: ${propertyType} - Execute time: ${executeTime} - Complete`
            ).show();
        } else {
            await ChatBotTelegram.getInstance().sendMessage(
                `<b>🤖[Group data]🤖</b>\n✅Group data suspended - TID: ${transactionType} - PID: ${propertyType} - Execute time: ${executeTime}`
            );
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Group data - TID: ${transactionType} - PID: ${propertyType} - Execute time: ${executeTime} - Suspended`
            ).show();
        }
        process.exit(0);
    }
}

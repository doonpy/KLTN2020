import LogicBase from '../logic.base';
import GroupedDataModelInterface from './grouped-data.model.interface';
import { DocumentQuery, Query } from 'mongoose';
import GroupedDataModel from './grouped-data.model';
import { Exception } from '../exception/exception.index';
import { Database } from '../database/database.index';
import { GroupedDataErrorResponseMessage, GroupedDataErrorResponseRootCause } from './grouped-data.error-response';
import { RawData } from '../raw-data/raw-data.index';
import GroupedDataApiInterface from './grouped-data.api.interface';
import { ResponseStatusCode } from '../../common/common.response-status.code';
import RawDataModelInterface from '../raw-data/raw-data.model.interface';
import RawDataApiInterface from '../raw-data/raw-data.api.interface';

export default class GroupedDataLogic extends LogicBase {
    /**
     * Get all grouped data
     * @param limit
     * @param offset
     * @param isPopulate
     * @return Promise<{ groupedDataset: Array<GroupedDataModelInterface>; hasNext: boolean }>
     */
    public async getAll(
        isPopulate: boolean,
        limit?: number | undefined,
        offset?: number | undefined
    ): Promise<{
        groupedDataset: GroupedDataModelInterface[];
        hasNext: boolean;
    }> {
        try {
            const groupedDataQuery: DocumentQuery<
                GroupedDataModelInterface[],
                GroupedDataModelInterface,
                object
            > = GroupedDataModel.find();
            const remainGroupedDataQuery: Query<number> = GroupedDataModel.countDocuments();

            if (isPopulate) {
                groupedDataQuery
                    .populate({
                        path: 'items',
                        populate: {
                            path: 'detailUrlId',
                            populate: { path: 'catalogId', populate: { path: 'hostId' } },
                        },
                    })
                    .populate('coordinate');
            }

            if (offset) {
                groupedDataQuery.skip(offset);
                remainGroupedDataQuery.skip(offset);
            }

            if (limit) {
                groupedDataQuery.limit(limit);
            }

            const groupedDataset: GroupedDataModelInterface[] = await groupedDataQuery.exec();
            const remainCatalog: number = await remainGroupedDataQuery.exec();

            return { groupedDataset, hasNext: groupedDataset.length < remainCatalog };
        } catch (error) {
            throw new Exception.Customize(
                error.statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param id
     *
     * @return Promise<object>
     */
    public async getById(id: string | number): Promise<GroupedDataModelInterface | null> {
        try {
            await GroupedDataLogic.checkGroupedDataExistedWithId(id);

            return await GroupedDataModel.findById(id)
                .populate({
                    path: 'items',
                    populate: {
                        path: 'detailUrlId',
                        populate: { path: 'catalogId', populate: { path: 'hostId' } },
                    },
                })
                .populate('coordinate')
                .exec();
        } catch (error) {
            throw new Exception.Customize(
                error.statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param {Array<number>} items
     *
     * @return Promise<object>
     */
    public async create(items: number[]): Promise<GroupedDataModelInterface> {
        try {
            for (const item of items) {
                await RawData.Logic.checkRawDataExistedWithId(item);
            }

            return await (
                await new GroupedDataModel({
                    items,
                }).save()
            )
                .populate({
                    path: 'items',
                    populate: {
                        path: 'detailUrlId',
                        populate: { path: 'catalogId', populate: { path: 'hostId' } },
                    },
                })
                .populate('coordinate')
                .execPopulate();
        } catch (error) {
            throw new Exception.Customize(
                error.statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param id
     * @param body
     *
     * @return Promise<object>
     */
    public async update(
        id: string | number,
        { items }: GroupedDataModelInterface
    ): Promise<GroupedDataModelInterface | undefined> {
        try {
            await GroupedDataLogic.checkGroupedDataExistedWithId(id);
            for (const item of items) {
                await RawData.Logic.checkRawDataExistedWithId(item);
            }

            const groupedData: GroupedDataModelInterface | null = await GroupedDataModel.findById(id).exec();
            if (!groupedData) {
                return;
            }

            groupedData.items = items;

            return await (await groupedData.save())
                .populate({
                    path: 'items',
                    populate: {
                        path: 'detailUrlId',
                        populate: { path: 'catalogId', populate: { path: 'hostId' } },
                    },
                })
                .populate('coordinate')
                .execPopulate();
        } catch (error) {
            throw new Exception.Customize(
                error.statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param id
     *
     * @return Promise<null>
     */
    public async delete(id: string): Promise<null> {
        try {
            await GroupedDataLogic.checkGroupedDataExistedWithId(id);
            await GroupedDataModel.findByIdAndDelete(id).exec();

            return null;
        } catch (error) {
            throw new Exception.Customize(
                error.statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param id
     * @param isNot
     */
    public static async checkGroupedDataExistedWithId(
        id: string | number | RawDataModelInterface,
        isNot: boolean = false
    ): Promise<void> {
        if (typeof id === 'object') {
            id = id._id;
        }
        const result: number = await GroupedDataModel.countDocuments({
            _id: id as number,
        }).exec();

        if (!isNot && result === 0) {
            throw new Exception.Customize(
                ResponseStatusCode.BAD_REQUEST,
                GroupedDataErrorResponseMessage.GRD_MSG_1,
                GroupedDataErrorResponseRootCause.GRD_RC_1,
                ['id', id]
            );
        }

        if (isNot && result > 0) {
            throw new Exception.Customize(
                ResponseStatusCode.BAD_REQUEST,
                GroupedDataErrorResponseMessage.GRD_MSG_2,
                GroupedDataErrorResponseRootCause.GRD_RC_2,
                ['id', id]
            );
        }
    }

    /**
     * Create grouped data document
     * @param {Array<number>} items
     * @return {GroupedDataModelInterface}
     */
    public static createDocument(items: number[]): GroupedDataModelInterface {
        return new GroupedDataModel({ items });
    }

    /**
     * Aggregation query
     * @param {Array<object>} aggregations
     * @return {Promise<Array<any>>}
     */
    public static async aggregationQuery(aggregations: object[]): Promise<any[]> {
        return GroupedDataModel.aggregate(aggregations).exec();
    }

    /**
     * @param {GroupedDataModelInterface} groupedData
     * @param {boolean} isPopulate
     */
    public static convertToResponse(
        { _id, items, cTime, mTime }: GroupedDataModelInterface,
        isPopulate?: boolean
    ): GroupedDataApiInterface {
        const data: GroupedDataApiInterface = {
            id: null,
            items: null,
            createAt: null,
            updateAt: null,
        };

        if (_id) {
            data.id = _id;
        }

        if (items) {
            if (isPopulate) {
                data.items = items.map(
                    (item): RawDataApiInterface => {
                        return RawData.Logic.convertToResponse(item as RawDataModelInterface);
                    }
                );
            } else {
                data.items = items as number[];
            }
        }

        if (cTime) {
            data.createAt = cTime;
        }

        if (mTime) {
            data.updateAt = mTime;
        }

        return data;
    }
}

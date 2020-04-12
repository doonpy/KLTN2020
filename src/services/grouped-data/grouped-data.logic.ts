import LogicBase from '../logic.base';
import GroupedDataModelInterface from './grouped-data.model.interface';
import { DocumentQuery, Query } from 'mongoose';
import GroupedDataModel from './grouped-data.model';
import { Exception } from '../exception/exception.index';
import { Common } from '../../common/common.index';
import { Database } from '../database/database.index';
import { GroupedDataErrorResponseMessage, GroupedDataErrorResponseRootCause } from './grouped-data.error-response';
import { RawData } from '../raw-data/raw-data.index';
import GroupedDataApiInterface from './grouped-data.api.interface';

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
    ): Promise<{ groupedDataset: Array<GroupedDataModelInterface>; hasNext: boolean }> {
        try {
            let groupedDataQuery: DocumentQuery<
                Array<GroupedDataModelInterface>,
                GroupedDataModelInterface,
                object
            > = GroupedDataModel.find();
            let remainGroupedDataQuery: Query<number> = GroupedDataModel.countDocuments();

            if (isPopulate) {
                groupedDataQuery.populate({
                    path: 'items',
                    populate: {
                        path: 'detailUrlId coordinate',
                        populate: { path: 'catalogId', populate: { path: 'hostId' } },
                    },
                });
            }

            if (offset) {
                groupedDataQuery.skip(offset);
                remainGroupedDataQuery.skip(offset);
            }

            if (limit) {
                groupedDataQuery.limit(limit);
            }

            let groupedDataset: Array<GroupedDataModelInterface> = await groupedDataQuery.exec();
            let remainCatalog: number = await remainGroupedDataQuery.exec();

            return { groupedDataset: groupedDataset, hasNext: groupedDataset.length < remainCatalog };
        } catch (error) {
            throw new Exception.Customize(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
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
                        path: 'detailUrlId coordinate',
                        populate: { path: 'catalogId', populate: { path: 'hostId' } },
                    },
                })
                .exec();
        } catch (error) {
            throw new Exception.Customize(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
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
    public async create(items: Array<number>): Promise<GroupedDataModelInterface> {
        try {
            for (const item of items) {
                await RawData.Logic.checkRawDataExistedWithId(item);
            }

            return await (
                await new GroupedDataModel({
                    items: items,
                }).save()
            )
                .populate({
                    path: 'items',
                    populate: { path: 'detailUrlId', populate: { path: 'catalogId', populate: { path: 'hostId' } } },
                })
                .execPopulate();
        } catch (error) {
            throw new Exception.Customize(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
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

            let groupedData: GroupedDataModelInterface | null = await GroupedDataModel.findById(id).exec();
            if (!groupedData) {
                return;
            }

            groupedData.items = items;

            return await (await groupedData.save())
                .populate({
                    path: 'items',
                    populate: { path: 'detailUrlId', populate: { path: 'catalogId', populate: { path: 'hostId' } } },
                })
                .execPopulate();
        } catch (error) {
            throw new Exception.Customize(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
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
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
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
        id: string | number | RawData.DocumentInterface,
        isNot: boolean = false
    ): Promise<void> {
        if (typeof id === 'object') {
            id = id._id;
        }
        let result: number = await GroupedDataModel.countDocuments({ _id: id }).exec();

        if (!isNot && result === 0) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                GroupedDataErrorResponseMessage.GRD_MSG_1,
                GroupedDataErrorResponseRootCause.GRD_RC_1,
                ['id', id]
            );
        }

        if (isNot && result > 0) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                GroupedDataErrorResponseMessage.GRD_MSG_2,
                GroupedDataErrorResponseRootCause.GRD_RC_2,
                ['id', id]
            );
        }
    }

    /**
     * Create grouped data document
     * @param {Array<RawData.DocumentInterface>} items
     * @return {GroupedDataModelInterface}
     */
    public static createDocument(items: Array<RawData.DocumentInterface>): GroupedDataModelInterface {
        return new GroupedDataModel({ items: items });
    }

    /**
     * Aggregation query
     * @param {Array<object>} aggregations
     * @return {Promise<Array<any>>}
     */
    public static async aggregationQuery(aggregations: Array<object>): Promise<Array<any>> {
        return await GroupedDataModel.aggregate(aggregations).exec();
    }

    /**
     * @param {GroupedDataModelInterface} groupedData
     * @param {boolean} isPopulate
     */
    public static convertToResponse(
        { _id, items, cTime, mTime }: GroupedDataModelInterface,
        isPopulate?: boolean
    ): GroupedDataApiInterface {
        let data: GroupedDataApiInterface = {
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
                    (item): RawData.ApiInterface => {
                        return RawData.Logic.convertToResponse(<RawData.DocumentInterface>item);
                    }
                );
            } else {
                data.items = <Array<number>>items;
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

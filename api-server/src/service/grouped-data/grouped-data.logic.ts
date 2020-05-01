import { DocumentQuery, Query } from 'mongoose';
import GroupedDataModel from './grouped-data.model';
import { GroupedDataApiModel, GroupedDataDocumentModel, GroupedDataLogicInterface } from './grouped-data.interface';
import ResponseStatusCode from '../../common/common.response-status.code';
import RawDataLogic from '../raw-data/raw-data.logic';
import CommonServiceLogicBase from '../../common/service/common.service.logic.base';
import { RawDataApiModel, RawDataDocumentModel } from '../raw-data/raw-data.interface';
import CommonServiceWording from '../../common/service/common.service.wording';
import GroupedDataWording from './grouped-data.wording';

export default class GroupedDataLogic extends CommonServiceLogicBase implements GroupedDataLogicInterface {
    private static instance: GroupedDataLogic;

    /**
     * @return {GroupedDataLogic}
     */
    public static getInstance(): GroupedDataLogic {
        if (!this.instance) {
            this.instance = new GroupedDataLogic();
        }

        return this.instance;
    }

    /**
     * @param {number | undefined} limit
     * @param {number | undefined} offset
     * @param {object | undefined} conditions
     * @param {boolean | undefined} isPopulate
     *
     * @return Promise<{ documents: GroupedDataDocumentModel[]; hasNext: boolean }>
     */
    public async getAll(
        limit?: number,
        offset?: number,
        conditions?: object,
        isPopulate?: boolean
    ): Promise<{
        documents: GroupedDataDocumentModel[];
        hasNext: boolean;
    }> {
        let documentQuery: DocumentQuery<
            GroupedDataDocumentModel[],
            GroupedDataDocumentModel,
            {}
        > = GroupedDataModel.find();
        const remainQuery: Query<number> = GroupedDataModel.countDocuments();

        if (isPopulate) {
            documentQuery = this.addPopulateQuery(documentQuery) as DocumentQuery<
                GroupedDataDocumentModel[],
                GroupedDataDocumentModel,
                {}
            >;
        }

        if (offset) {
            documentQuery.skip(offset);
            remainQuery.skip(offset);
        }

        if (limit) {
            documentQuery.limit(limit);
        }

        const groupedDataset: GroupedDataDocumentModel[] = await documentQuery.exec();
        const remainCatalog: number = await remainQuery.exec();

        return { documents: groupedDataset, hasNext: groupedDataset.length < remainCatalog };
    }

    /**
     * @param {number} id
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<GroupedDataDocumentModel>}
     */
    public async getById(id: number, isPopulate?: boolean): Promise<GroupedDataDocumentModel> {
        let query: DocumentQuery<
            GroupedDataDocumentModel | null,
            GroupedDataDocumentModel,
            {}
        > = GroupedDataModel.findById(id);
        if (isPopulate) {
            query = this.addPopulateQuery(query) as DocumentQuery<
                GroupedDataDocumentModel | null,
                GroupedDataDocumentModel,
                {}
            >;
        }

        return (await query.exec()) as GroupedDataDocumentModel;
    }

    /**
     * @param {GroupedDataApiModel} body
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<GroupedDataDocumentModel>}
     */
    public async create({ items }: GroupedDataDocumentModel, isPopulate?: boolean): Promise<GroupedDataDocumentModel> {
        const createdDoc: GroupedDataDocumentModel = await new GroupedDataModel({
            items,
        }).save();

        if (isPopulate) {
            return await this.getPopulateDocument(createdDoc);
        }

        return createdDoc;
    }

    /**
     * @param {number} id
     * @param {GroupedDataApiModel} body
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<GroupedDataDocumentModel>}
     */
    public async update(
        id: number,
        { items }: GroupedDataDocumentModel,
        isPopulate?: boolean
    ): Promise<GroupedDataDocumentModel> {
        const groupedData: GroupedDataDocumentModel = await this.getById(id);

        groupedData.items = items;

        if (isPopulate) {
            return await this.getPopulateDocument(await groupedData.save());
        }

        return await groupedData.save();
    }

    /**
     * @param {number} id
     *
     * @return {Promise<void>}
     */
    public async delete(id: number): Promise<void> {
        await GroupedDataModel.findByIdAndDelete(id).exec();
    }

    /**
     * @param {number} id
     *
     * @return {Promise<boolean>}
     */
    public async isExistsWithId(id: number | GroupedDataDocumentModel): Promise<boolean> {
        if (typeof id === 'object') {
            id = id._id;
        }
        const result: number = await GroupedDataModel.countDocuments({ _id: id }).exec();

        return result !== 0;
    }

    /**
     * @param {number} id
     * @param {boolean | undefined} isNot
     *
     * @return {Promise<void>}
     */
    public async checkExistsWithId(id: number | GroupedDataDocumentModel, isNot?: boolean): Promise<void> {
        const isExists: boolean = await this.isExistsWithId(id);

        if (isNot) {
            if (isExists) {
                throw {
                    statusCode: ResponseStatusCode.BAD_REQUEST,
                    cause: {
                        wording: CommonServiceWording.CAUSE.CAU_CM_SER_2,
                        value: [GroupedDataWording.GRD_2],
                    },
                    message: {
                        wording: CommonServiceWording.MESSAGE.MSG_CM_SER_2,
                        value: [GroupedDataWording.GRD_2, GroupedDataWording.GRD_1, id],
                    },
                };
            }
        } else if (!isExists) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_1, value: [GroupedDataWording.GRD_2] },
                message: {
                    wording: CommonServiceWording.MESSAGE.MSG_CM_SER_1,
                    value: [GroupedDataWording.GRD_2, GroupedDataWording.GRD_1, id],
                },
            };
        }
    }

    /**
     * @param {Array<object>} aggregations
     *
     * @return {Promise<Array<any>>}
     */
    public async aggregationQuery(aggregations: object[]): Promise<object[]> {
        return GroupedDataModel.aggregate(aggregations).exec();
    }

    /**
     * @param {DocumentQuery<GroupedDataDocumentModel | GroupedDataDocumentModel[] | null, GroupedDataDocumentModel, {}>} query
     *
     * @return {DocumentQuery<GroupedDataDocumentModel | GroupedDataDocumentModel[] | null, GroupedDataDocumentModel, {}>}
     */
    public addPopulateQuery(
        query: DocumentQuery<GroupedDataDocumentModel | GroupedDataDocumentModel[] | null, GroupedDataDocumentModel, {}>
    ): DocumentQuery<GroupedDataDocumentModel | GroupedDataDocumentModel[] | null, GroupedDataDocumentModel, {}> {
        return query.populate({
            path: 'items',
            populate: {
                path: 'detailUrlId coordinate',
                populate: { path: 'catalogId', populate: { path: 'hostId patternId' } },
            },
        });
    }

    /**
     * @param {GroupedDataDocumentModel} document
     *
     * @return {Promise<GroupedDataDocumentModel>}
     */
    public async getPopulateDocument(document: GroupedDataDocumentModel): Promise<GroupedDataDocumentModel> {
        return await document
            .populate({
                path: 'items',
                populate: {
                    path: 'detailUrlId coordinate',
                    populate: { path: 'catalogId', populate: { path: 'hostId patternId' } },
                },
            })
            .execPopulate();
    }

    /**
     * @param {GroupedDataDocumentModel}
     *
     * @return {GroupedDataApiModel}
     */
    public convertToApiResponse({ _id, items, cTime, mTime }: GroupedDataDocumentModel): GroupedDataApiModel {
        const itemsConverted: (RawDataApiModel | number | null)[] = items.map((item):
            | RawDataApiModel
            | number
            | null => {
            if (item) {
                if (typeof item === 'object') {
                    return RawDataLogic.getInstance().convertToApiResponse(item as RawDataDocumentModel);
                } else {
                    return item as number;
                }
            }

            return null;
        });

        return {
            id: _id ?? null,
            items: itemsConverted,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

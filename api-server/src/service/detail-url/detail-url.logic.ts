import { DocumentQuery, Query } from 'mongoose';
import DetailUrlModel from './detail-url.model';
import ResponseStatusCode from '../../common/common.response-status.code';
import { CatalogApiModel, CatalogDocumentModel } from '../catalog/catalog.interface';
import CommonServiceLogicBase from '../../common/service/common.service.logic.base';
import { DetailUrlApiModel, DetailUrlDocumentModel, DetailUrlLogicInterface } from './detail-url.interface';
import CommonServiceWording from '../../common/service/common.service.wording';
import DetailUrlWording from './detail-url.wording';
import CatalogLogic from '../catalog/catalog.logic';

export default class DetailUrlLogic extends CommonServiceLogicBase implements DetailUrlLogicInterface {
    private static instance: DetailUrlLogic;

    /**
     * @return {DetailUrlLogic}
     */
    public static getInstance(): DetailUrlLogic {
        if (!this.instance) {
            this.instance = new DetailUrlLogic();
        }

        return this.instance;
    }

    /**
     * @param {number | undefined} limit
     * @param {number | undefined} offset
     * @param {object | undefined} conditions
     * @param {boolean | undefined} isPopulate
     *
     * @return Promise<{ documents: DetailUrlDocumentModel[]; hasNext: boolean }>
     */
    public async getAll(
        limit?: number,
        offset?: number,
        conditions?: object,
        isPopulate?: boolean
    ): Promise<{ documents: DetailUrlDocumentModel[]; hasNext: boolean }> {
        let documentQuery: DocumentQuery<
            DetailUrlDocumentModel[],
            DetailUrlDocumentModel,
            object
        > = DetailUrlModel.find(conditions || {});
        const remainQuery: Query<number> = DetailUrlModel.countDocuments(conditions || {});

        if (isPopulate) {
            documentQuery = this.addPopulateQuery(documentQuery) as DocumentQuery<
                DetailUrlDocumentModel[],
                DetailUrlDocumentModel,
                object
            >;
        }

        if (offset) {
            documentQuery.skip(offset);
            remainQuery.skip(offset);
        }

        if (limit) {
            documentQuery.limit(limit);
        }

        const detailUrls: DetailUrlDocumentModel[] = await documentQuery.exec();
        const remainDetailUrl: number = await remainQuery.exec();

        return {
            documents: detailUrls,
            hasNext: detailUrls.length < remainDetailUrl,
        };
    }

    /**
     * @param {number} id
     * @param {boolean | undefined} isPopulate
     *
     * @return Promise<DetailUrlDocumentModel>
     */
    public async getById(id: number, isPopulate?: boolean): Promise<DetailUrlDocumentModel> {
        let query: DocumentQuery<DetailUrlDocumentModel | null, DetailUrlDocumentModel> = DetailUrlModel.findById(id);
        if (isPopulate) {
            query = this.addPopulateQuery(query) as DocumentQuery<
                DetailUrlDocumentModel | null,
                DetailUrlDocumentModel
            >;
        }

        return (await query.exec()) as DetailUrlDocumentModel;
    }

    /**
     * @param {DetailUrlDocumentModel} body
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<DetailUrlDocumentModel>}
     */
    public async create(
        { catalogId, url, isExtracted = false, requestRetries = 0 }: DetailUrlDocumentModel,
        isPopulate?: boolean
    ): Promise<DetailUrlDocumentModel> {
        const createdDoc: DetailUrlDocumentModel = await new DetailUrlModel({
            catalogId,
            url,
            isExtracted: isExtracted || false,
            requestRetries: requestRetries || 0,
        }).save();

        if (isPopulate) {
            return await this.getPopulateDocument(createdDoc);
        }

        return createdDoc;
    }

    /**
     * @param {number} id
     * @param {DetailUrlDocumentModel} body
     * @param {boolean | undefined} isPopulate

     * @return Promise<DetailUrlDocumentModel>
     */
    public async update(
        id: number,
        { catalogId, url, isExtracted, requestRetries }: DetailUrlDocumentModel,
        isPopulate?: boolean
    ): Promise<DetailUrlDocumentModel> {
        const detailUrl: DetailUrlDocumentModel = await this.getById(id);
        await CatalogLogic.getInstance().checkExistsWithId(catalogId);

        detailUrl.catalogId = catalogId || detailUrl.catalogId;
        detailUrl.url = url || detailUrl.url;
        detailUrl.isExtracted = isExtracted !== detailUrl.isExtracted ? isExtracted : detailUrl.isExtracted;
        detailUrl.requestRetries =
            requestRetries !== detailUrl.requestRetries ? requestRetries : detailUrl.requestRetries;

        if (isPopulate) {
            return await this.getPopulateDocument(await detailUrl.save());
        }

        return await detailUrl.save();
    }

    /**
     * @param {number} id
     *
     * @return Promise<void>
     */
    public async delete(id: number): Promise<void> {
        await DetailUrlModel.findByIdAndDelete(id).exec();
    }

    /**
     * @param {number} id
     *
     * @return {Promise<boolean>}
     */
    public async isExistsWithId(id: number | DetailUrlDocumentModel): Promise<boolean> {
        if (typeof id === 'object') {
            id = id._id;
        }
        const result: number = await DetailUrlModel.countDocuments({
            _id: id,
        }).exec();

        return result !== 0;
    }

    /**
     * @param {string} url
     *
     * @return {Promise<boolean>}
     */
    public async isExistsWithUrl(url: string): Promise<boolean> {
        const result: number = await DetailUrlModel.countDocuments({
            url,
        }).exec();

        return result !== 0;
    }

    /**
     * @param {string} url
     * @param {boolean | undefined} isNot
     *
     * @return {Promise<void>}
     */
    public async checkExistsWithUrl(url: string, isNot?: boolean): Promise<void> {
        const isExists: boolean = await this.isExistsWithUrl(url);

        if (isNot) {
            if (isExists) {
                throw {
                    statusCode: ResponseStatusCode.BAD_REQUEST,
                    cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_2, value: [DetailUrlWording.DTU_2] },
                    message: {
                        wording: CommonServiceWording.MESSAGE.MSG_CM_SER_2,
                        value: [DetailUrlWording.DTU_2, DetailUrlWording.DTU_3, url],
                    },
                };
            }
        } else if (!isExists) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_1, value: [DetailUrlWording.DTU_2] },
                message: {
                    wording: CommonServiceWording.MESSAGE.MSG_CM_SER_1,
                    value: [DetailUrlWording.DTU_2, DetailUrlWording.DTU_3, url],
                },
            };
        }
    }

    /**
     * @param {number} id
     * @param {boolean | undefined} isNot
     *
     * @return {Promise<void>}
     */
    public async checkExistsWithId(id: number | DetailUrlDocumentModel, isNot?: boolean): Promise<void> {
        const isExists: boolean = await this.isExistsWithId(id);

        if (isNot) {
            if (isExists) {
                throw {
                    statusCode: ResponseStatusCode.BAD_REQUEST,
                    cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_2, value: [DetailUrlWording.DTU_2] },
                    message: {
                        wording: CommonServiceWording.MESSAGE.MSG_CM_SER_2,
                        value: [DetailUrlWording.DTU_2, DetailUrlWording.DTU_1, id],
                    },
                };
            }
        } else if (!isExists) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_1, value: [DetailUrlWording.DTU_2] },
                message: {
                    wording: CommonServiceWording.MESSAGE.MSG_CM_SER_1,
                    value: [DetailUrlWording.DTU_2, DetailUrlWording.DTU_1, id],
                },
            };
        }
    }

    /**
     * @param {object[]} aggregations
     *
     * @return {Promise<any[]>}
     */
    public async aggregationQuery(aggregations: object[]): Promise<object[]> {
        return DetailUrlModel.aggregate(aggregations).allowDiskUse(true).exec();
    }

    /**
     * @param {DocumentQuery<DetailUrlDocumentModel | DetailUrlDocumentModel[] | null, DetailUrlDocumentModel, {}>} query
     *
     * @return {DocumentQuery<DetailUrlDocumentModel | DetailUrlDocumentModel[] | null, DetailUrlDocumentModel, {}>}
     */
    public addPopulateQuery(
        query: DocumentQuery<DetailUrlDocumentModel | DetailUrlDocumentModel[] | null, DetailUrlDocumentModel, {}>
    ): DocumentQuery<DetailUrlDocumentModel | DetailUrlDocumentModel[] | null, DetailUrlDocumentModel, {}> {
        return query.populate({
            path: 'catalogId',
            populate: { path: 'hostId' },
        });
    }

    /**
     * @param {DetailUrlDocumentModel} document
     *
     * @return {Promise<DetailUrlDocumentModel>}
     */
    public async getPopulateDocument(document: DetailUrlDocumentModel): Promise<DetailUrlDocumentModel> {
        return await document
            .populate({
                path: 'catalogId',
                populate: { path: 'hostId' },
            })
            .execPopulate();
    }

    /**
     * @param {DetailUrlDocumentModel}
     *
     * @return {DetailUrlApiModel}
     */
    public convertToApiResponse({
        _id,
        catalogId,
        url,
        isExtracted,
        requestRetries,
        cTime,
        mTime,
    }: DetailUrlDocumentModel): DetailUrlApiModel {
        let catalog: CatalogApiModel | number | null = null;

        if (catalogId) {
            if (typeof catalogId === 'object') {
                catalog = CatalogLogic.getInstance().convertToApiResponse(catalogId as CatalogDocumentModel);
            } else {
                catalog = catalogId as number;
            }
        }

        return {
            id: _id ?? null,
            catalog,
            url: url ?? null,
            isExtracted: isExtracted ?? null,
            requestRetries: requestRetries ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

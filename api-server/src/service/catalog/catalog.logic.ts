import { DocumentQuery, Query } from 'mongoose';
import CatalogModel from './catalog.model';
import { CatalogApiModel, CatalogDocumentModel, CatalogLogicInterface } from './catalog.interface';
import CommonLogicBase from '../../common/service/common.service.logic.base';
import CatalogWording from './catalog.wording';
import ResponseStatusCode from '../../common/common.response-status.code';
import { HostDocumentModel } from '../host/host.interface';
import { PatternDocumentModel } from '../pattern/pattern.interface';
import CommonServiceWording from '../../common/service/common.service.wording';
import HostLogic from '../host/host.logic';
import PatternLogic from '../pattern/pattern.logic';

export default class CatalogLogic extends CommonLogicBase implements CatalogLogicInterface {
    public static instance: CatalogLogic;

    /**
     * @return {CatalogLogic}
     */
    public static getInstance(): CatalogLogic {
        if (!this.instance) {
            this.instance = new CatalogLogic();
        }
        return this.instance;
    }

    /**
     * @param {number | undefined} limit
     * @param {number | undefined} offset
     * @param {object | undefined} conditions
     * @param {boolean | undefined} isPopulate
     *
     * @return Promise<{ documents: CatalogDocumentModel[]; hasNext: boolean }>
     */
    public async getAll(
        limit?: number,
        offset?: number,
        conditions?: object,
        isPopulate?: boolean
    ): Promise<{ documents: CatalogDocumentModel[]; hasNext: boolean }> {
        let datasetQuery: DocumentQuery<CatalogDocumentModel[], CatalogDocumentModel, {}> = CatalogModel.find(
            conditions || {}
        );
        const remainQuery: Query<number> = CatalogModel.countDocuments(conditions || {});

        if (isPopulate) {
            datasetQuery = this.addPopulateQuery(datasetQuery) as DocumentQuery<
                CatalogDocumentModel[],
                CatalogDocumentModel,
                {}
            >;
        }

        if (offset) {
            datasetQuery.skip(offset);
            remainQuery.skip(offset);
        }

        if (limit) {
            datasetQuery.limit(limit);
        }

        const catalogs: CatalogDocumentModel[] = await datasetQuery.exec();
        const remainCatalog: number = await remainQuery.exec();

        return { documents: catalogs, hasNext: catalogs.length < remainCatalog };
    }

    /**
     * @param {number} id
     * @param {boolean | undefined} isPopulate
     *
     * @return Promise<CatalogDocumentModel>
     */
    public async getById(id: number, isPopulate?: boolean): Promise<CatalogDocumentModel> {
        let query: DocumentQuery<CatalogDocumentModel | null, CatalogDocumentModel> = CatalogModel.findById(id);

        if (isPopulate) {
            query = this.addPopulateQuery(query) as DocumentQuery<
                CatalogDocumentModel | null,
                CatalogDocumentModel,
                {}
            >;
        }
        return (await query.exec()) as CatalogDocumentModel;
    }

    /**
     * @param {CatalogDocumentModel} body
     * @param {boolean | undefined} isPopulate
     *
     * @return Promise<CatalogDocumentModel>
     */
    public async create(
        { title, url, locator, hostId, patternId }: CatalogDocumentModel,
        isPopulate?: boolean
    ): Promise<CatalogDocumentModel> {
        const createdDoc: CatalogDocumentModel = await new CatalogModel({
            title,
            url,
            locator,
            hostId,
            patternId: patternId || 0,
        }).save();

        if (isPopulate) {
            return await this.getPopulateDocument(createdDoc);
        }

        return createdDoc;
    }

    /**
     * @param {number} id
     * @param {PatternDocumentModel} body
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<object>}
     */
    public async update(
        id: number,
        { title, url, locator, hostId, patternId }: CatalogDocumentModel,
        isPopulate?: boolean
    ): Promise<CatalogDocumentModel> {
        const catalog: CatalogDocumentModel = await this.getById(id);

        catalog.title = title || catalog.title;
        catalog.url = url || catalog.url;
        if (locator && Object.keys(locator).length > 0) {
            catalog.locator.detailUrl = locator.detailUrl || catalog.locator.detailUrl;
            catalog.locator.pageNumber = locator.pageNumber || catalog.locator.pageNumber;
        }
        catalog.hostId = hostId || catalog.hostId;
        catalog.patternId = patternId || catalog.patternId;

        if (isPopulate) {
            return await this.getPopulateDocument(await catalog.save());
        }

        return await catalog.save();
    }

    /**
     * @param id
     *
     * @return Promise<void>
     */
    public async delete(id: number): Promise<void> {
        await CatalogModel.findByIdAndDelete(id).exec();
    }

    /**
     * @param {number} id
     *
     * @return {Promise<boolean>}
     */
    public async isExistsWithId(id: number | CatalogDocumentModel): Promise<boolean> {
        if (typeof id === 'object') {
            id = id._id;
        }
        const result: number = await CatalogModel.countDocuments({
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
        const result: number = await CatalogModel.countDocuments({
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
                    cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_2, value: [CatalogWording.CTL_2] },
                    message: {
                        wording: CommonServiceWording.MESSAGE.MSG_CM_SER_2,
                        value: [CatalogWording.CTL_2, CatalogWording.CTL_3, url],
                    },
                };
            }
        } else if (!isExists) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_1, value: [CatalogWording.CTL_2] },
                message: {
                    wording: CommonServiceWording.MESSAGE.MSG_CM_SER_1,
                    value: [CatalogWording.CTL_2, CatalogWording.CTL_3, url],
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
    public async checkExistsWithId(id: number | CatalogDocumentModel, isNot?: boolean): Promise<void> {
        const isExists: boolean = await this.isExistsWithId(id);

        if (isNot) {
            if (isExists) {
                throw {
                    statusCode: ResponseStatusCode.BAD_REQUEST,
                    cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_2, value: [CatalogWording.CTL_2] },
                    message: {
                        wording: CommonServiceWording.MESSAGE.MSG_CM_SER_2,
                        value: [CatalogWording.CTL_2, CatalogWording.CTL_1, id],
                    },
                };
            }
        } else if (!isExists) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_1, value: [CatalogWording.CTL_2] },
                message: {
                    wording: CommonServiceWording.MESSAGE.MSG_CM_SER_1,
                    value: [CatalogWording.CTL_2, CatalogWording.CTL_1, id],
                },
            };
        }
    }

    /**
     * @param {DocumentQuery<CatalogDocumentModel | CatalogDocumentModel[] | null, CatalogDocumentModel, {}>} query
     *
     * @return {DocumentQuery<CatalogDocumentModel | CatalogDocumentModel[] | null, CatalogDocumentModel, {}>}
     */
    public addPopulateQuery(
        query: DocumentQuery<CatalogDocumentModel | CatalogDocumentModel[] | null, CatalogDocumentModel, {}>
    ): DocumentQuery<CatalogDocumentModel | CatalogDocumentModel[] | null, CatalogDocumentModel, {}> {
        return query.populate({
            path: 'patternId hostId',
            populate: {
                path: 'sourceId',
                populate: { path: 'catalogId', populate: { path: 'hostId' } },
            },
        });
    }

    /**
     * @param {CatalogDocumentModel} document
     *
     * @return {Promise<CatalogDocumentModel>}
     */
    public async getPopulateDocument(document: CatalogDocumentModel): Promise<CatalogDocumentModel> {
        return await document
            .populate({
                path: 'patternId hostId',
                populate: {
                    path: 'sourceId',
                    populate: { path: 'catalogId', populate: { path: 'hostId' } },
                },
            })
            .execPopulate();
    }

    /**
     * @param {CatalogDocumentModel}
     * @param {number} languageIndex
     *
     * @return {CatalogApiModel}
     */
    public convertToApiResponse(
        { _id, title, url, locator, hostId, patternId, cTime, mTime }: CatalogDocumentModel,
        languageIndex = 0
    ): CatalogApiModel {
        return {
            id: _id ?? null,
            title: title ?? null,
            url: url ?? null,
            locator: locator ?? null,
            host: hostId ? HostLogic.getInstance().convertToApiResponse(hostId as HostDocumentModel) : null,
            pattern: patternId
                ? PatternLogic.getInstance().convertToApiResponse(patternId as PatternDocumentModel)
                : null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

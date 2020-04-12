import DetailUrlModel from './detail-url.model';
import { Exception } from '../exception/exception.index';
import { Catalog } from '../catalog/catalog.index';
import DetailUrlModelInterface from './detail-url.model.interface';
import { DocumentQuery, Query } from 'mongoose';
import LogicBase from '../logic.base';
import { Database } from '../database/database.index';
import { DetailUrlErrorResponseMessage, DetailUrlErrorResponseRootCause } from './detail-url.error-response';
import { Common } from '../../common/common.index';
import DetailUrlApiInterface from './detail-url.api.interface';

export default class DetailUrlLogic extends LogicBase {
    /**
     * @param conditions
     * @param isPopulate
     * @param limit
     * @param offset
     *
     * @return Promise<{ catalogs: Array<DetailUrlModelInterface>; hasNext: boolean }>
     */
    public async getAll(
        conditions: { [key: string]: any },
        isPopulate: boolean,
        limit?: number,
        offset?: number
    ): Promise<{ detailUrls: Array<DetailUrlModelInterface>; hasNext: boolean }> {
        try {
            let detailUrlQuery: DocumentQuery<
                Array<DetailUrlModelInterface>,
                DetailUrlModelInterface,
                object
            > = DetailUrlModel.find(conditions);
            let remainDetailUrlQuery: Query<number> = DetailUrlModel.countDocuments(conditions);

            if (isPopulate) {
                detailUrlQuery.populate({
                    path: 'catalogId',
                    populate: { path: 'hostId' },
                });
            }

            if (offset) {
                detailUrlQuery.skip(offset);
                remainDetailUrlQuery.skip(offset);
            }

            if (limit) {
                detailUrlQuery.limit(limit);
            }

            let detailUrls: Array<DetailUrlModelInterface> = await detailUrlQuery.exec();
            let remainDetailUrl: number = await remainDetailUrlQuery.exec();

            return {
                detailUrls: detailUrls,
                hasNext: detailUrls.length < remainDetailUrl,
            };
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
     * @return Promise<DetailUrlModelInterface>
     */
    public async getById(id: string | number): Promise<DetailUrlModelInterface | null> {
        try {
            await DetailUrlLogic.checkDetailUrlExistedWithId(id);

            return await DetailUrlModel.findById(id)
                .populate({ path: 'catalogId', populate: { path: 'hostId' } })
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
     * @param requestBody
     *
     * @return Promise<DetailUrlModelInterface>
     */
    public async create({
        catalogId,
        url,
        isExtracted = false,
        requestRetries = 0,
    }: DetailUrlModelInterface): Promise<DetailUrlModelInterface> {
        try {
            await Catalog.Logic.checkCatalogExistedWithId(catalogId);
            await DetailUrlLogic.checkDetailUrlExistedWithUrl(url, true);

            return await (
                await new DetailUrlModel({
                    catalogId: catalogId,
                    url: url,
                    isExtracted: isExtracted || false,
                    requestRetries: requestRetries || 0,
                }).save()
            )
                .populate({ path: 'catalogId', populate: { path: 'hostId' } })
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
     * @param requestBody
     *
     * @return Promise<DetailUrlModelInterface>
     */
    public async update(
        id: string | number,
        { catalogId, url, isExtracted, requestRetries }: DetailUrlModelInterface
    ): Promise<DetailUrlModelInterface | undefined> {
        try {
            await DetailUrlLogic.checkDetailUrlExistedWithId(id);
            await Catalog.Logic.checkCatalogExistedWithId(catalogId);

            let detailUrl: DetailUrlModelInterface | null = await DetailUrlModel.findById(id).exec();
            if (!detailUrl) {
                return;
            }

            if (detailUrl.url !== url) {
                await DetailUrlLogic.checkDetailUrlExistedWithUrl(url);
            }

            detailUrl.catalogId = catalogId || detailUrl.catalogId;
            detailUrl.url = url || detailUrl.url;
            detailUrl.isExtracted = isExtracted !== detailUrl.isExtracted ? isExtracted : detailUrl.isExtracted;
            detailUrl.requestRetries =
                requestRetries !== detailUrl.requestRetries ? requestRetries : detailUrl.requestRetries;

            return await (await detailUrl.save())
                .populate({ path: 'catalogId', populate: { path: 'hostId' } })
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
    public async delete(id: string | number): Promise<null> {
        try {
            await DetailUrlLogic.checkDetailUrlExistedWithId(id);
            await DetailUrlModel.findByIdAndDelete(id).exec();

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
     * @param url
     * @param isNot
     */
    public static async checkDetailUrlExistedWithUrl(url: string, isNot: boolean = false): Promise<void> {
        let result: number = await DetailUrlModel.countDocuments({
            url: url,
        }).exec();

        if (!isNot && result === 0) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                DetailUrlErrorResponseMessage.DU_MSG_1,
                DetailUrlErrorResponseRootCause.DU_RC_1,
                ['url', url]
            );
        }

        if (isNot && result > 0) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                DetailUrlErrorResponseMessage.DU_MSG_2,
                DetailUrlErrorResponseRootCause.DU_RC_2,
                ['url', url]
            );
        }
    }

    /**
     * @param id
     * @param isNot
     */
    public static async checkDetailUrlExistedWithId(
        id: number | string | DetailUrlModelInterface,
        isNot: boolean = false
    ): Promise<void> {
        if (typeof id === 'object') {
            id = id._id;
        }
        let result: number = await DetailUrlModel.countDocuments({ _id: id }).exec();

        if (!isNot && result === 0) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                DetailUrlErrorResponseMessage.DU_MSG_1,
                DetailUrlErrorResponseRootCause.DU_RC_1,
                ['id', id]
            );
        }

        if (isNot && result > 0) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                DetailUrlErrorResponseMessage.DU_MSG_2,
                DetailUrlErrorResponseRootCause.DU_RC_2,
                ['id', id]
            );
        }
    }

    /**
     * @param catalogId
     * @param url
     *
     * @return DetailUrlModelInterface
     */
    public static createDocument(catalogId: number | string, url: string): DetailUrlModelInterface {
        return new DetailUrlModel({
            catalogId: catalogId,
            url: url,
        });
    }

    public static async aggregationQuery(aggregations: Array<object>): Promise<Array<any>> {
        return await DetailUrlModel.aggregate(aggregations)
            .allowDiskUse(true)
            .exec();
    }

    /**
     * @param pattern
     * @param isPopulate
     */
    public static convertToResponse(
        { _id, catalogId, url, isExtracted, requestRetries, cTime, mTime }: DetailUrlModelInterface,
        isPopulate?: boolean
    ): DetailUrlApiInterface {
        let data: DetailUrlApiInterface = {
            id: null,
            catalog: null,
            url: null,
            isExtracted: null,
            requestRetries: null,
            createAt: null,
            updateAt: null,
        };

        if (_id) {
            data.id = _id;
        }

        if (catalogId && Object.keys(catalogId).length > 0 && isPopulate) {
            data.catalog = Catalog.Logic.convertToResponse(<Catalog.DocumentInterface>catalogId);
        } else {
            data.catalog = <number>catalogId;
        }

        if (url) {
            data.url = url;
        }

        if (isExtracted !== null || isExtracted !== undefined) {
            data.isExtracted = isExtracted;
        }

        if (requestRetries) {
            data.requestRetries = requestRetries;
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

import DetailUrlModel from './detail-url.model';
import CustomizeException from '../exception/customize.exception';
import { Constant } from '../../util/definition/constant';
import { Cause } from '../../util/definition/error/cause';
import { DetailUrlErrorMessage } from './detail.error-message';
import CatalogLogic from '../catalog/catalog.logic';
import CatalogModelInterface from '../catalog/catalog.model.interface';
import DetailUrlModelInterface from './detail-url.model.interface';
import { DocumentQuery, Query } from 'mongoose';

class DetailUrlLogic {
    /**
     * @param limit
     * @param offset
     * @param catalogId
     *
     * @return Promise<{ catalogs: Array<DetailUrlModelInterface>; hasNext: boolean }>
     */
    public async getAll(
        catalogId: number,
        limit: number = Constant.DEFAULT_VALUE.LIMIT,
        offset: number = Constant.DEFAULT_VALUE.OFFSET
    ): Promise<{ detailUrls: Array<DetailUrlModelInterface>; hasNext: boolean }> {
        try {
            let conditions: object = {
                catalogId: catalogId || { $gt: 0 },
            };
            let detailUrlQuery: DocumentQuery<
                Array<DetailUrlModelInterface>,
                DetailUrlModelInterface,
                object
            > = DetailUrlModel.find(conditions).populate({
                path: 'catalogId',
                populate: { path: 'hostId' },
            });
            let remainDetailUrlQuery: Query<number> = DetailUrlModel.countDocuments(conditions);

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
            throw new CustomizeException(
                error.statusCode || Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Cause.DATABASE
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
            throw new CustomizeException(
                error.statusCode || Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Cause.DATABASE
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
        isExtracted,
        requestRetries,
    }: DetailUrlModelInterface): Promise<DetailUrlModelInterface> {
        try {
            await CatalogLogic.checkCatalogExistedWithId(catalogId);
            await DetailUrlLogic.checkDetailUrlExistedWithUrl(url, catalogId);

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
            throw new CustomizeException(
                error.statusCode || Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Cause.DATABASE
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
            await CatalogLogic.checkCatalogExistedWithId(catalogId);

            let detailUrl: DetailUrlModelInterface | null = await DetailUrlModel.findById(
                id
            ).exec();
            if (!detailUrl) {
                return;
            }

            if (detailUrl.url !== url) {
                await DetailUrlLogic.checkDetailUrlExistedWithUrl(url, catalogId);
            }

            detailUrl.catalogId = catalogId || detailUrl.catalogId;
            detailUrl.url = url || detailUrl.url;
            detailUrl.isExtracted =
                isExtracted !== detailUrl.isExtracted ? isExtracted : detailUrl.isExtracted;
            detailUrl.requestRetries =
                requestRetries !== detailUrl.requestRetries
                    ? requestRetries
                    : detailUrl.requestRetries;

            return await (await detailUrl.save())
                .populate({ path: 'catalogId', populate: { path: 'hostId' } })
                .execPopulate();
        } catch (error) {
            throw new CustomizeException(
                error.statusCode || Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Cause.DATABASE
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
            throw new CustomizeException(
                error.statusCode || Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Cause.DATABASE
            );
        }
    }

    /**
     * @param url
     * @param catalogId
     */
    public static async checkDetailUrlExistedWithUrl(
        url: string,
        catalogId: CatalogModelInterface | number
    ): Promise<void> {
        if (typeof catalogId === 'object') {
            catalogId = catalogId._id;
        }
        if (
            (await DetailUrlModel.countDocuments({
                url: url,
                catalogId: catalogId || { $gt: 0 },
            }).exec()) > 0
        ) {
            new CustomizeException(
                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                DetailUrlErrorMessage.DU_ERROR_2,
                Cause.DATA_VALUE.EXISTS,
                ['url', url]
            ).raise();
        }
    }

    /**
     * @param id
     */
    public static async checkDetailUrlExistedWithId(
        id: number | string | DetailUrlModelInterface
    ): Promise<void> {
        if (typeof id === 'object') {
            id = id._id;
        }
        if ((await DetailUrlModel.countDocuments({ id: id }).exec()) === 0) {
            new CustomizeException(
                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                DetailUrlErrorMessage.DU_ERROR_1,
                Cause.DATA_VALUE.NOT_FOUND,
                ['id', id]
            ).raise();
        }
    }

    /**
     * @param id
     * @param catalogId
     */
    public static async isDetailUrlBelongCatalog(
        id: number | string | DetailUrlModelInterface,
        catalogId: number | string | CatalogModelInterface
    ): Promise<boolean> {
        if (typeof id === 'object') {
            id = id._id;
        }
        if (typeof catalogId === 'object') {
            catalogId = catalogId._id;
        }
        return (await DetailUrlModel.countDocuments({ _id: id, catalogId: catalogId }).exec()) > 0;
    }

    /**
     * @param conditions
     *
     * @return Promise<Array<DetailUrlModelInterface>>
     */
    public async getAllWithConditions(
        conditions: object = {}
    ): Promise<Array<DetailUrlModelInterface>> {
        try {
            return await DetailUrlModel.find(conditions)
                .populate({
                    path: 'catalogId',
                    populate: { path: 'hostId' },
                })
                .exec();
        } catch (error) {
            throw error;
        }
    }

    /**
     * @param pattern
     */
    public static convertToResponse({
        _id,
        catalogId,
        url,
        isExtracted,
        requestRetries,
        cTime,
        mTime,
    }: any): {
        id: number;
        catalog: object;
        url: string;
        isExtracted: boolean;
        requestRetries: number;
        createAt: string;
        updateAt: string;
    } {
        let data: {
            id: number;
            catalog: object;
            url: string;
            isExtracted: boolean;
            requestRetries: number;
            createAt: string;
            updateAt: string;
        } = {
            id: NaN,
            catalog: {},
            url: '',
            isExtracted: false,
            requestRetries: 0,
            createAt: '',
            updateAt: '',
        };

        if (_id) {
            data.id = _id;
        }

        if (catalogId && Object.keys(catalogId).length > 0) {
            data.catalog = CatalogLogic.convertToResponse(catalogId);
        }

        if (url) {
            data.url = url;
        }

        if (isExtracted) {
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

export default DetailUrlLogic;

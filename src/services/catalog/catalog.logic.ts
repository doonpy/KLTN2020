import CatalogModel from './catalog.model';
import { Exception } from '../exception/exception.index';
import { Host } from '../host/host.index';
import CatalogModelInterface from './catalog.model.interface';
import { DocumentQuery, Query } from 'mongoose';
import LogicBase from '../logic.base';
import {
    CatalogErrorResponseMessage,
    CatalogErrorResponseRootCause,
} from './catalog.error-response';
import { Common } from '../../common/common.index';
import { Database } from '../database/database.index';

export default class CatalogLogic extends LogicBase {
    /**
     * @param keyword
     * @param limit
     * @param offset
     * @param hostId
     *
     * @return Promise<{ catalogs: Array<CatalogModelInterface>; hasNext: boolean }>
     */
    public async getAll(
        hostId: number | undefined = undefined,
        keyword: string | undefined = undefined,
        limit: number | undefined = undefined,
        offset: number | undefined = undefined
    ): Promise<{ catalogs: Array<CatalogModelInterface>; hasNext: boolean }> {
        try {
            let conditions: object = {
                $or: [
                    { title: { $regex: keyword || '', $options: 'i' } },
                    { url: { $regex: keyword || '', $options: 'i' } },
                ],
                hostId: hostId || { $gt: 0 }, // get all without host id
            };
            let catalogQuery: DocumentQuery<
                Array<CatalogModelInterface>,
                CatalogModelInterface,
                object
            > = CatalogModel.find(conditions).populate('hostId');
            let remainCatalogQuery: Query<number> = CatalogModel.countDocuments(conditions);

            if (offset) {
                catalogQuery.skip(offset);
                remainCatalogQuery.skip(offset);
            }

            if (limit) {
                catalogQuery.limit(limit);
            }

            let catalogs: Array<CatalogModelInterface> = await catalogQuery.exec();
            let remainCatalog: number = await remainCatalogQuery.exec();

            return { catalogs: catalogs, hasNext: catalogs.length < remainCatalog };
        } catch (error) {
            throw new Exception.Api(
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
    public async getById(id: string | number): Promise<CatalogModelInterface | null> {
        try {
            await CatalogLogic.checkCatalogExistedWithId(id);

            return await CatalogModel.findById(id)
                .populate('hostId')
                .exec();
        } catch (error) {
            throw new Exception.Api(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param body
     *
     * @return Promise<object>
     */
    public async create({
        title,
        url,
        locator,
        hostId,
    }: CatalogModelInterface): Promise<CatalogModelInterface> {
        try {
            await CatalogLogic.checkCatalogExistedWithUrl(url, hostId, true);
            await Host.Logic.checkHostExistedWithId(hostId);

            return await (
                await new CatalogModel({
                    title: title,
                    url: url,
                    locator: locator,
                    hostId: hostId,
                }).save()
            )
                .populate('hostId')
                .execPopulate();
        } catch (error) {
            throw new Exception.Api(
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
        { title, url, locator, hostId }: CatalogModelInterface
    ): Promise<CatalogModelInterface | undefined> {
        try {
            await CatalogLogic.checkCatalogExistedWithId(id);
            await Host.Logic.checkHostExistedWithId(hostId);

            let catalog: CatalogModelInterface | null = await CatalogModel.findById(id).exec();
            if (!catalog) {
                return;
            }

            if (catalog.url !== url) {
                await CatalogLogic.checkCatalogExistedWithUrl(url, hostId);
            }

            catalog.title = title || catalog.title;
            catalog.url = url || catalog.url;
            if (locator && Object.keys(locator).length > 0) {
                catalog.locator.detailUrl = locator.detailUrl || catalog.locator.detailUrl;
                catalog.locator.pageNumber = locator.pageNumber || catalog.locator.pageNumber;
            }
            catalog.hostId = hostId || catalog.hostId;

            return await (await catalog.save()).populate('hostId').execPopulate();
        } catch (error) {
            throw new Exception.Api(
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
            await CatalogLogic.checkCatalogExistedWithId(id);
            await CatalogModel.findByIdAndDelete(id).exec();

            return null;
        } catch (error) {
            throw new Exception.Api(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param url
     * @param hostId
     * @param isNot
     */
    public static checkCatalogExistedWithUrl = async (
        url: string,
        hostId?: Host.DocumentInterface | number,
        isNot: boolean = false
    ): Promise<void> => {
        if (typeof hostId === 'object') {
            hostId = hostId._id;
        }
        let result: number = await CatalogModel.countDocuments({
            url: url,
            hostId: hostId || { $gt: 0 },
        }).exec();

        if (!isNot && result === 0) {
            throw new Exception.Api(
                Common.ResponseStatusCode.BAD_REQUEST,
                CatalogErrorResponseMessage.CTL_MSG_1,
                CatalogErrorResponseRootCause.CTL_RC_1,
                ['url', url]
            );
        }

        if (isNot && result > 0) {
            throw new Exception.Api(
                Common.ResponseStatusCode.BAD_REQUEST,
                CatalogErrorResponseMessage.CTL_MSG_2,
                CatalogErrorResponseRootCause.CTL_RC_2,
                ['url', url]
            );
        }
    };

    /**
     * @param id
     * @param isNot
     */
    public static async checkCatalogExistedWithId(
        id: string | number | CatalogModelInterface,
        isNot: boolean = false
    ): Promise<void> {
        if (typeof id === 'object') {
            id = id._id;
        }
        let result: number = await CatalogModel.countDocuments({ _id: id }).exec();

        if (!isNot && result === 0) {
            throw new Exception.Api(
                Common.ResponseStatusCode.BAD_REQUEST,
                CatalogErrorResponseMessage.CTL_MSG_1,
                CatalogErrorResponseRootCause.CTL_RC_1,
                ['id', id]
            );
        }

        if (isNot && result > 0) {
            throw new Exception.Api(
                Common.ResponseStatusCode.BAD_REQUEST,
                CatalogErrorResponseMessage.CTL_MSG_2,
                CatalogErrorResponseRootCause.CTL_RC_2,
                ['id', id]
            );
        }
    }

    /**
     * @param catalog
     */
    public static convertToResponse({
        _id,
        title,
        url,
        locator,
        hostId,
        cTime,
        mTime,
    }: CatalogModelInterface): {
        id: number;
        title: string;
        locator: { detailUrl: string; pageNumber: string };
        host: object;
        createAt: string;
        updateAt: string;
    } {
        let data: {
            id: number;
            title: string;
            url: string;
            locator: { detailUrl: string; pageNumber: string };
            host: { id: number; name: string; domain: string };
            createAt: string;
            updateAt: string;
        } = {
            id: NaN,
            title: '',
            url: '',
            locator: { detailUrl: '', pageNumber: '' },
            host: { id: NaN, name: '', domain: '' },
            createAt: '',
            updateAt: '',
        };

        if (_id) {
            data.id = _id;
        }

        if (title) {
            data.title = title;
        }

        if (url) {
            data.url = url;
        }

        if (locator) {
            data.locator = locator;
        }

        if (hostId && Object.keys(hostId).length > 0) {
            data.host = Host.Logic.convertToResponse(<Host.DocumentInterface>hostId);
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

import CatalogModel from './catalog.model';
import { Exception } from '../exception/exception.index';
import { Host } from '../host/host.index';
import CatalogModelInterface from './catalog.model.interface';
import { DocumentQuery, Query } from 'mongoose';
import LogicBase from '../logic.base';
import { CatalogErrorResponseMessage, CatalogErrorResponseRootCause } from './catalog.error-response';
import { Common } from '../../common/common.index';
import { Database } from '../database/database.index';
import { Pattern } from '../pattern/pattern.index';
import CatalogApiInterface from './catalog.api.interface';

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
            > = CatalogModel.find(conditions)
                .populate('hostId')
                .populate({
                    path: 'patternId',
                    populate: {
                        path: 'sourceId',
                        populate: { path: 'catalogId', populate: { path: 'hostId' } },
                    },
                });
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
    public async getById(id: string | number): Promise<CatalogModelInterface | null> {
        try {
            await CatalogLogic.checkCatalogExistedWithId(id);

            return await CatalogModel.findById(id)
                .populate('hostId')
                .populate({
                    path: 'patternId',
                    populate: {
                        path: 'sourceId',
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
     * @param body
     *
     * @return Promise<object>
     */
    public async create({
        title,
        url,
        locator,
        hostId,
        patternId,
    }: CatalogModelInterface): Promise<CatalogModelInterface> {
        try {
            await CatalogLogic.checkCatalogExistedWithUrl(url, hostId, true);
            await Host.Logic.checkHostExistedWithId(hostId);
            if (patternId) {
                await Pattern.Logic.checkPatternExistedWithId(patternId);
            }

            return await (
                await new CatalogModel({
                    title: title,
                    url: url,
                    locator: locator,
                    hostId: hostId,
                    patternId: patternId || 0,
                }).save()
            )
                .populate('hostId')
                .populate({
                    path: 'patternId',
                    populate: {
                        path: 'sourceId',
                        populate: { path: 'catalogId', populate: { path: 'hostId' } },
                    },
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
        { title, url, locator, hostId, patternId }: CatalogModelInterface
    ): Promise<CatalogModelInterface | undefined> {
        try {
            await CatalogLogic.checkCatalogExistedWithId(id);
            await Host.Logic.checkHostExistedWithId(hostId);
            if (patternId) {
                await Pattern.Logic.checkPatternExistedWithId(patternId);
            }

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
            catalog.patternId = patternId || catalog.patternId;

            return await (await catalog.save())
                .populate('hostId')
                .populate({
                    path: 'patternId',
                    populate: {
                        path: 'sourceId',
                        populate: { path: 'catalogId', populate: { path: 'hostId' } },
                    },
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
            await CatalogLogic.checkCatalogExistedWithId(id);
            await CatalogModel.findByIdAndDelete(id).exec();

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
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                CatalogErrorResponseMessage.CTL_MSG_1,
                CatalogErrorResponseRootCause.CTL_RC_1,
                ['url', url]
            );
        }

        if (isNot && result > 0) {
            throw new Exception.Customize(
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
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                CatalogErrorResponseMessage.CTL_MSG_1,
                CatalogErrorResponseRootCause.CTL_RC_1,
                ['id', id]
            );
        }

        if (isNot && result > 0) {
            throw new Exception.Customize(
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
        patternId,
        cTime,
        mTime,
    }: CatalogModelInterface): CatalogApiInterface {
        let data: CatalogApiInterface = {
            id: null,
            title: null,
            url: null,
            locator: null,
            host: null,
            pattern: null,
            createAt: null,
            updateAt: null,
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

        if (patternId && Object.keys(patternId).length > 0) {
            data.pattern = Pattern.Logic.convertToResponse(<Pattern.DocumentInterface>patternId);
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

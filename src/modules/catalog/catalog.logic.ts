import CatalogModel from './catalog.model';
import CustomizeException from '../exception/customize.exception';
import { Constant } from '../../util/definition/constant';
import { CatalogErrorMessage } from './catalog.error-message';
import { Cause } from '../../util/definition/error/cause';
import HostLogic from '../host/host.logic';
import CatalogModelInterface from './catalog.model.interface';
import HostModelInterface from '../host/host.model.interface';
import { DocumentQuery, Query } from 'mongoose';

class CatalogLogic {
    /**
     * @param keyword
     * @param limit
     * @param offset
     * @param hostId
     *
     * @return Promise<{ catalogs: Array<CatalogModelInterface>; hasNext: boolean }>
     */
    public async getAll(
        hostId: number,
        keyword: string,
        limit: number,
        offset: number
    ): Promise<{ catalogs: Array<CatalogModelInterface>; hasNext: boolean }> {
        try {
            let conditions: object = {
                $or: [
                    { title: { $regex: keyword, $options: 'i' } },
                    { url: { $regex: keyword, $options: 'i' } },
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
     * @return Promise<object>
     */
    public async getById(id: string | number): Promise<CatalogModelInterface | null> {
        try {
            await CatalogLogic.checkCatalogExistedWithId(id);

            return await CatalogModel.findById(id)
                .populate('hostId')
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
            await CatalogLogic.checkCatalogExistedWithUrl(url, hostId);
            await HostLogic.checkHostExistedWithId(hostId);

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
            throw new CustomizeException(
                error.statusCode || Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Cause.DATABASE
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
            await HostLogic.checkHostExistedWithId(hostId);

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
    public async delete(id: string): Promise<null> {
        try {
            await CatalogLogic.checkCatalogExistedWithId(id);
            await CatalogModel.findByIdAndDelete(id).exec();

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
     * @param hostId
     */
    public static checkCatalogExistedWithUrl = async (
        url: string,
        hostId?: HostModelInterface | number
    ): Promise<void> => {
        if (typeof hostId === 'object') {
            hostId = hostId._id;
        }
        if (
            (await CatalogModel.countDocuments({ url: url, hostId: hostId || { $gt: 0 } }).exec()) >
            0
        ) {
            new CustomizeException(
                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                CatalogErrorMessage.CTL_ERR_2,
                Cause.DATA_VALUE.EXISTS,
                ['url', url]
            ).raise();
        }
    };

    /**
     * @param id
     */
    public static checkCatalogExistedWithId = async (
        id: string | number | CatalogModelInterface
    ): Promise<void> => {
        if (typeof id === 'object') {
            id = id._id;
        }
        if ((await CatalogModel.countDocuments({ _id: id }).exec()) === 0) {
            new CustomizeException(
                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                CatalogErrorMessage.CTL_ERR_1,
                Cause.DATA_VALUE.NOT_FOUND,
                ['id', id]
            ).raise();
        }
    };

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
    }: any): {
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
            data.host = HostLogic.convertToResponse(hostId);
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

export default CatalogLogic;

import PatternModel from './pattern.model';
import CustomizeException from '../exception/customize.exception';
import { Constant } from '../../util/definition/constant';
import { Cause } from '../../util/definition/error/cause';
import { PatternErrorMessage } from './pattern.error-message';
import DetailUrlLogic from '../detail-url/detail-url.logic';
import CatalogLogic from '../catalog/catalog.logic';
import CatalogModelInterface from '../catalog/catalog.model.interface';
import PatternModelInterface from './pattern.model.interface';
import { DocumentQuery, Query } from 'mongoose';

class PatternLogic {
    /**
     * @param limit
     * @param offset
     * @param catalogId
     *
     * @return Promise<{ patterns: Array<PatternModelInterface>; hasNext: boolean }>
     */
    public async getAll(
        limit: number,
        offset: number,
        catalogId: number
    ): Promise<{ patterns: Array<PatternModelInterface>; hasNext: boolean }> {
        try {
            let conditions: object = { catalogId: catalogId || { $gt: 0 } };
            let patternQuery: DocumentQuery<
                Array<PatternModelInterface>,
                PatternModelInterface,
                object
            > = PatternModel.find(conditions)
                .populate({ path: 'catalogId', populate: { path: 'hostId' } })
                .populate({
                    path: 'sourceUrlId',
                    populate: {
                        path: 'catalogId',
                        populate: { path: 'hostId' },
                    },
                });
            let remainPatternQuery: Query<number> = PatternModel.countDocuments(conditions);

            if (offset) {
                patternQuery.skip(offset);
                remainPatternQuery.skip(offset);
            }

            if (limit) {
                patternQuery.limit(limit);
            }

            let patterns: Array<PatternModelInterface> = await patternQuery.exec();
            let remainPattern: number = await remainPatternQuery.exec();

            return { patterns: patterns, hasNext: patterns.length < remainPattern };
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
     * @return Promise<PatternModelInterface>
     */
    public async getById(id: string | number): Promise<PatternModelInterface | null> {
        try {
            await PatternLogic.checkPatternExistedWithId(id);

            return await PatternModel.findById(id)
                .populate({ path: 'catalogId', populate: { path: 'hostId' } })
                .populate({
                    path: 'sourceUrlId',
                    populate: {
                        path: 'catalogId',
                        populate: { path: 'hostId' },
                    },
                })
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
     * @return Promise<PatternModelInterface>
     */
    public async create({
        catalogId,
        sourceUrlId,
        mainLocator,
        subLocator,
    }: PatternModelInterface): Promise<PatternModelInterface> {
        try {
            await CatalogLogic.checkCatalogExistedWithId(catalogId);
            await DetailUrlLogic.checkDetailUrlExistedWithId(sourceUrlId);
            await PatternLogic.checkPatternExistedWithCatalogId(catalogId);
            await DetailUrlLogic.isDetailUrlBelongCatalog(sourceUrlId, catalogId);

            return await (
                await new PatternModel({
                    catalogId: catalogId,
                    sourceUrlId: sourceUrlId,
                    mainLocator: mainLocator,
                    subLocator: subLocator,
                }).save()
            )
                .populate({ path: 'catalogId', populate: { path: 'hostId' } })
                .populate({
                    path: 'sourceUrlId',
                    populate: {
                        path: 'catalogId',
                        populate: { path: 'hostId' },
                    },
                })
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
     * @return Promise<PatternModelInterface>
     */
    public async update(
        id: string | number,
        { catalogId, sourceUrlId, mainLocator, subLocator }: PatternModelInterface
    ): Promise<PatternModelInterface | undefined> {
        try {
            await PatternLogic.checkPatternExistedWithId(id);
            await DetailUrlLogic.isDetailUrlBelongCatalog(sourceUrlId, catalogId);

            let pattern: PatternModelInterface | null = await PatternModel.findById(id).exec();
            if (!pattern) {
                return;
            }
            if (pattern.catalogId !== catalogId) {
                await PatternLogic.checkPatternExistedWithCatalogId(catalogId);
                await CatalogLogic.checkCatalogExistedWithId(catalogId);
            }

            if (pattern.sourceUrlId !== sourceUrlId) {
                await DetailUrlLogic.checkDetailUrlExistedWithId(sourceUrlId);
            }

            pattern.catalogId = catalogId || pattern.catalogId;
            pattern.sourceUrlId = sourceUrlId || pattern.sourceUrlId;
            if (mainLocator) {
                pattern.mainLocator.propertyType =
                    mainLocator.propertyType || pattern.mainLocator.propertyType;
                pattern.mainLocator.title = mainLocator.title || pattern.mainLocator.title;
                pattern.mainLocator.price = mainLocator.price || pattern.mainLocator.price;
                pattern.mainLocator.acreage = mainLocator.acreage || pattern.mainLocator.acreage;
                pattern.mainLocator.address = mainLocator.address || pattern.mainLocator.address;
            }
            if (subLocator.length > 0) {
                subLocator.forEach((subLocatorItem: { name: string; locator: string }): void => {
                    if (!pattern) {
                        return;
                    }
                    let subLocatorSimilarIndex = pattern.subLocator.findIndex(
                        (s: { name: string; locator: string }): boolean => {
                            return s.name === subLocatorItem.name;
                        }
                    );
                    if (subLocatorSimilarIndex >= 0) {
                        pattern.subLocator[subLocatorSimilarIndex] = subLocatorItem;
                    }
                });
            }

            return await (await pattern.save())
                .populate({ path: 'catalogId', populate: { path: 'hostId' } })
                .populate({
                    path: 'sourceUrlId',
                    populate: {
                        path: 'catalogId',
                        populate: { path: 'hostId' },
                    },
                })
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
            await PatternLogic.checkPatternExistedWithId(id);
            await PatternModel.findByIdAndDelete(id).exec();

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
     * @param catalogId
     *
     * @return Promise<PatternModelInterface | null>
     */
    public async getByCatalogId(catalogId: number | string): Promise<PatternModelInterface | null> {
        try {
            return await PatternModel.findOne({ catalogId: catalogId })
                .populate({
                    path: 'sourceUrlId',
                    populate: {
                        path: 'catalogId',
                        populate: { path: 'hostId' },
                    },
                })
                .exec();
        } catch (error) {
            throw error;
        }
    }

    /**
     * @param catalogId
     */
    public static async checkPatternExistedWithCatalogId(
        catalogId: CatalogModelInterface | number | string
    ): Promise<void> {
        if (typeof catalogId === 'object') {
            catalogId = catalogId._id;
        }
        if ((await PatternModel.countDocuments({ catalogId: catalogId }).exec()) > 0) {
            new CustomizeException(
                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                PatternErrorMessage.PTN_ERROR_2,
                Cause.DATA_VALUE.EXISTS,
                ['catalogId', catalogId]
            ).raise();
        }
    }

    /**
     * @param id
     */
    public static async checkPatternExistedWithId(id: number | string): Promise<void> {
        if ((await PatternModel.countDocuments({ _id: id }).exec()) > 0) {
            new CustomizeException(
                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                PatternErrorMessage.PTN_ERROR_1,
                Cause.DATA_VALUE.NOT_FOUND,
                ['id', id]
            ).raise();
        }
    }

    /**
     * @param pattern
     */
    public static convertToResponse({
        _id,
        catalogId,
        sourceUrlId,
        mainLocator,
        subLocator,
        cTime,
        mTime,
    }: any): {
        id: number;
        catalog: object;
        sourceUrl: object;
        mainLocator: {
            title: string;
            price: string;
            acreage: string;
            address: string;
        };
        subLocator: { name: string; locator: string };
        createAt: string;
        updateAt: string;
    } {
        let data: {
            id: number;
            catalog: object;
            sourceUrl: object;
            mainLocator: {
                title: string;
                price: string;
                acreage: string;
                address: string;
            };
            subLocator: { name: string; locator: string };
            createAt: string;
            updateAt: string;
        } = {
            id: NaN,
            catalog: {},
            sourceUrl: {},
            mainLocator: { title: '', price: '', acreage: '', address: '' },
            subLocator: { name: '', locator: '' },
            createAt: '',
            updateAt: '',
        };

        if (_id) {
            data.id = _id;
        }

        if (catalogId && Object.keys(catalogId).length > 0) {
            data.catalog = CatalogLogic.convertToResponse(catalogId);
        }

        if (sourceUrlId && Object.keys(sourceUrlId).length > 0) {
            data.sourceUrl = DetailUrlLogic.convertToResponse(sourceUrlId);
        }

        if (Object.keys(mainLocator).length > 0) {
            data.mainLocator = mainLocator;
        }

        if (Object.keys(subLocator).length > 0) {
            data.subLocator = subLocator;
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

export default PatternLogic;

import PatternModel from './pattern.model';
import { Exception } from '../exception/exception.index';
import { Catalog } from '../catalog/catalog.index';
import { DetailUrl } from '../detail-url/detail-url.index';
import PatternModelInterface from './pattern.model.interface';
import { DocumentQuery, Query } from 'mongoose';
import LogicBase from '../logic.base';
import { Database } from '../database/database.index';
import {
    PatternErrorResponseMessage,
    PatternErrorResponseRootCause,
} from './pattern.error-response';
import { Common } from '../../common/common.index';

export default class PatternLogic extends LogicBase {
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
            throw new Exception.Api(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
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
            await Catalog.Logic.checkCatalogExistedWithId(catalogId);
            await DetailUrl.Logic.checkDetailUrlExistedWithId(sourceUrlId);
            await PatternLogic.checkPatternExistedWithCatalogId(catalogId, true);
            await DetailUrl.Logic.isDetailUrlBelongCatalog(sourceUrlId, catalogId);

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
            throw new Exception.Api(
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
     * @return Promise<PatternModelInterface>
     */
    public async update(
        id: string | number,
        { catalogId, sourceUrlId, mainLocator, subLocator }: PatternModelInterface
    ): Promise<PatternModelInterface | undefined> {
        try {
            await PatternLogic.checkPatternExistedWithId(id);
            await DetailUrl.Logic.isDetailUrlBelongCatalog(sourceUrlId, catalogId);

            let pattern: PatternModelInterface | null = await PatternModel.findById(id).exec();
            if (!pattern) {
                return;
            }
            if (pattern.catalogId !== catalogId) {
                await PatternLogic.checkPatternExistedWithCatalogId(catalogId);
                await Catalog.Logic.checkCatalogExistedWithId(catalogId);
            }

            if (pattern.sourceUrlId !== sourceUrlId) {
                await DetailUrl.Logic.checkDetailUrlExistedWithId(sourceUrlId);
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
                if (Object.keys(mainLocator.postDate).length > 0) {
                    pattern.mainLocator.postDate.locator =
                        mainLocator.postDate.locator || pattern.mainLocator.postDate.locator;
                    pattern.mainLocator.postDate.format =
                        mainLocator.postDate.format || pattern.mainLocator.postDate.format;
                    pattern.mainLocator.postDate.delimiter =
                        mainLocator.postDate.delimiter || pattern.mainLocator.postDate.delimiter;
                }
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
    public async delete(id: string | number): Promise<null> {
        try {
            await PatternLogic.checkPatternExistedWithId(id);
            await PatternModel.findByIdAndDelete(id).exec();

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
            throw new Exception.Api(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param catalogId
     * @param isNot
     */
    public static async checkPatternExistedWithCatalogId(
        catalogId: Catalog.DocumentInterface | number | string,
        isNot: boolean = false
    ): Promise<void> {
        if (typeof catalogId === 'object') {
            catalogId = catalogId._id;
        }
        let result: number = await PatternModel.countDocuments({ catalogId: catalogId }).exec();

        if (!isNot && result === 0) {
            throw new Exception.Api(
                Common.ResponseStatusCode.BAD_REQUEST,
                PatternErrorResponseMessage.PTN_MSG_1,
                PatternErrorResponseRootCause.PTN_RC_1,
                ['catalogId', catalogId]
            );
        }

        if (isNot && result > 0) {
            throw new Exception.Api(
                Common.ResponseStatusCode.BAD_REQUEST,
                PatternErrorResponseMessage.PTN_MSG_2,
                PatternErrorResponseRootCause.PTN_RC_2,
                ['catalogId', catalogId]
            );
        }
    }

    /**
     * @param id
     * @param isNot
     */
    public static async checkPatternExistedWithId(
        id: number | string,
        isNot: boolean = false
    ): Promise<void> {
        let result: number = await PatternModel.countDocuments({ _id: id }).exec();

        if (!isNot && result === 0) {
            throw new Exception.Api(
                Common.ResponseStatusCode.BAD_REQUEST,
                PatternErrorResponseMessage.PTN_MSG_1,
                PatternErrorResponseRootCause.PTN_RC_1,
                ['id', id]
            );
        }

        if (isNot && result > 0) {
            throw new Exception.Api(
                Common.ResponseStatusCode.BAD_REQUEST,
                PatternErrorResponseMessage.PTN_MSG_2,
                PatternErrorResponseRootCause.PTN_RC_2,
                ['id', id]
            );
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
    }: PatternModelInterface): {
        id: number;
        catalog: object;
        sourceUrl: object;
        mainLocator: {
            propertyType: string;
            title: string;
            price: string;
            acreage: string;
            address: string;
            postDate: {
                locator: string;
                format: string;
                delimiter: string;
            };
        };
        subLocator: Array<{ name: string; locator: string }> | Array<null>;
        createAt: string;
        updateAt: string;
    } {
        let data: {
            id: number;
            catalog: object;
            sourceUrl: object;
            mainLocator: {
                propertyType: string;
                title: string;
                price: string;
                acreage: string;
                address: string;
                postDate: { locator: string; format: string; delimiter: string };
            };
            subLocator: Array<{ name: string; locator: string }> | Array<null>;
            createAt: string;
            updateAt: string;
        } = {
            id: NaN,
            catalog: {},
            sourceUrl: {},
            mainLocator: {
                propertyType: '',
                title: '',
                price: '',
                acreage: '',
                address: '',
                postDate: {
                    locator: '',
                    format: '',
                    delimiter: '',
                },
            },
            subLocator: [],
            createAt: '',
            updateAt: '',
        };

        if (_id) {
            data.id = _id;
        }

        if (catalogId && Object.keys(catalogId).length > 0) {
            data.catalog = Catalog.Logic.convertToResponse(<Catalog.DocumentInterface>catalogId);
        }

        if (sourceUrlId && Object.keys(sourceUrlId).length > 0) {
            data.sourceUrl = DetailUrl.Logic.convertToResponse(
                <DetailUrl.DocumentInterface>sourceUrlId
            );
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

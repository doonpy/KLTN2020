import PatternModel from './pattern.model';
import { Exception } from '../exception/exception.index';
import PatternModelInterface from './pattern.model.interface';
import { DocumentQuery, Query } from 'mongoose';
import LogicBase from '../logic.base';
import { Database } from '../database/database.index';
import { PatternErrorResponseMessage, PatternErrorResponseRootCause } from './pattern.error-response';
import { Common } from '../../common/common.index';
import PatternApiInterface from './pattern.api.interface';

export default class PatternLogic extends LogicBase {
    /**
     * @param limit
     * @param offset
     *
     * @return Promise<{ patterns: Array<PatternModelInterface>; hasNext: boolean }>
     */
    public async getAll(
        limit: number,
        offset: number
    ): Promise<{ patterns: Array<PatternModelInterface>; hasNext: boolean }> {
        try {
            let patternQuery: DocumentQuery<
                Array<PatternModelInterface>,
                PatternModelInterface,
                object
            > = PatternModel.find();
            let remainPatternQuery: Query<number> = PatternModel.countDocuments();

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
     * @return Promise<PatternModelInterface>
     */
    public async getById(id: string | number): Promise<PatternModelInterface | null> {
        try {
            await PatternLogic.checkPatternExistedWithId(id);

            return await PatternModel.findById(id).exec();
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
     * @return Promise<PatternModelInterface>
     */
    public async create({ sourceUrl, mainLocator, subLocator }: PatternModelInterface): Promise<PatternModelInterface> {
        try {
            return await new PatternModel({
                sourceUrl: sourceUrl,
                mainLocator: mainLocator,
                subLocator: subLocator,
            }).save();
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
     * @return Promise<PatternModelInterface>
     */
    public async update(
        id: string | number,
        { sourceUrl, mainLocator, subLocator }: PatternModelInterface
    ): Promise<PatternModelInterface | undefined> {
        try {
            await PatternLogic.checkPatternExistedWithId(id);

            let pattern: PatternModelInterface | null = await PatternModel.findById(id).exec();
            if (!pattern) {
                return;
            }

            pattern.sourceUrl = sourceUrl || pattern.sourceUrl;
            if (mainLocator) {
                pattern.mainLocator.propertyType = mainLocator.propertyType || pattern.mainLocator.propertyType;
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

            return await pattern.save();
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
            await PatternLogic.checkPatternExistedWithId(id);
            await PatternModel.findByIdAndDelete(id).exec();

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
     * @param id
     * @param isNot
     */
    public static async checkPatternExistedWithId(
        id: number | string | PatternModelInterface,
        isNot: boolean = false
    ): Promise<void> {
        if (!id) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                PatternErrorResponseMessage.PTN_MSG_1,
                PatternErrorResponseRootCause.PTN_RC_1,
                ['id', id]
            );
        }

        if (typeof id === 'object') {
            id = id._id;
        }
        let result: number = await PatternModel.countDocuments({ _id: id }).exec();

        if (!isNot && result === 0) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                PatternErrorResponseMessage.PTN_MSG_1,
                PatternErrorResponseRootCause.PTN_RC_1,
                ['id', id]
            );
        }

        if (isNot && result > 0) {
            throw new Exception.Customize(
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
        sourceUrl,
        mainLocator,
        subLocator,
        cTime,
        mTime,
    }: PatternModelInterface): PatternApiInterface {
        let data: PatternApiInterface = {
            id: null,
            sourceUrl: null,
            mainLocator: null,
            subLocator: null,
            createAt: null,
            updateAt: null,
        };

        if (_id) {
            data.id = _id;
        }

        if (sourceUrl) {
            data.sourceUrl = sourceUrl;
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

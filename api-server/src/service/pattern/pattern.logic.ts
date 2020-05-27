import { DocumentQuery, Query } from 'mongoose';
import PatternModel from './pattern.model';
import PatternWording from './pattern.wording';
import ResponseStatusCode from '@common/common.response-status.code';
import CommonServiceLogicBase from '@common/service/common.service.logic.base';
import { PatternApiModel, PatternDocumentModel, PatternLogicInterface } from './pattern.interface';
import CommonServiceWording from '@common/service/common.service.wording';

export default class PatternLogic extends CommonServiceLogicBase implements PatternLogicInterface {
    public static instance: PatternLogic;

    /**
     * @return {PatternLogic}
     */
    public static getInstance(): PatternLogic {
        if (!this.instance) {
            this.instance = new PatternLogic();
        }

        return this.instance;
    }

    /**
     * @param {number | undefined} limit
     * @param {number | undefined} offset
     * @param {object | undefined} conditions
     * @param {boolean | undefined} isPopulate
     *
     * @return Promise<{ documents: PatternDocumentModel[]; hasNext: boolean }>
     */
    public async getAll(
        limit?: number,
        offset?: number,
        conditions?: object,
        isPopulate?: boolean
    ): Promise<{ documents: PatternDocumentModel[]; hasNext: boolean }> {
        const documentQuery: DocumentQuery<PatternDocumentModel[], PatternDocumentModel, {}> = PatternModel.find(
            conditions || {}
        );
        const remainQuery: Query<number> = PatternModel.countDocuments(conditions || {});

        if (offset) {
            documentQuery.skip(offset);
            remainQuery.skip(offset);
        }

        if (limit) {
            documentQuery.limit(limit);
        }

        const patterns: PatternDocumentModel[] = await documentQuery.exec();
        const remainPattern: number = await remainQuery.exec();

        return { documents: patterns, hasNext: patterns.length < remainPattern };
    }

    /**
     * @param {number} id
     *
     * @return {Promise<PatternDocumentModel>}
     */
    public async getById(id: number): Promise<PatternDocumentModel> {
        return (await PatternModel.findById(id).exec()) as PatternDocumentModel;
    }

    /**
     * @param {PatternDocumentModel} requestBody
     *
     * @return {Promise<PatternDocumentModel>}
     */
    public async create({ sourceUrl, mainLocator, subLocator }: PatternDocumentModel): Promise<PatternDocumentModel> {
        return (await new PatternModel({
            sourceUrl,
            mainLocator,
            subLocator,
        }).save()) as PatternDocumentModel;
    }

    /**
     * @param {number} id
     * @param {PatternDocumentModel} requestBody
     *
     * @return {Promise<PatternDocumentModel>}
     */
    public async update(
        id: number,
        { sourceUrl, mainLocator, subLocator }: PatternDocumentModel
    ): Promise<PatternDocumentModel> {
        const pattern: PatternDocumentModel = await this.getById(id);

        pattern.sourceUrl = sourceUrl || pattern.sourceUrl;
        if (mainLocator) {
            pattern.mainLocator.propertyType = mainLocator.propertyType || pattern.mainLocator.propertyType;
            pattern.mainLocator.title = mainLocator.title || pattern.mainLocator.title;
            pattern.mainLocator.describe = mainLocator.describe || pattern.mainLocator.describe;
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
            subLocator.forEach((subLocatorItem: { name: string; value: string }): void => {
                if (!pattern) {
                    return;
                }
                const subLocatorSimilarIndex = pattern.subLocator.findIndex(
                    (s: { name: string; value: string }): boolean => {
                        return s.name === subLocatorItem.name;
                    }
                );
                if (subLocatorSimilarIndex >= 0) {
                    pattern.subLocator[subLocatorSimilarIndex] = subLocatorItem;
                }
            });
        }

        return await pattern.save();
    }

    /**
     * @param {number} id
     *
     * @return {Promise<void>}
     */
    public async delete(id: number): Promise<void> {
        await PatternModel.findByIdAndDelete(id).exec();
    }

    /**
     * @param {number} id
     *
     * @return {Promise<boolean>}
     */
    public async isExistsWithId(id: number | PatternDocumentModel): Promise<boolean> {
        if (typeof id === 'object') {
            id = id._id;
        }
        const result: number = await PatternModel.countDocuments({
            _id: id,
        }).exec();

        return result !== 0;
    }

    /**
     * @param {number} id
     * @param {boolean | undefined} isNot
     *
     * @return {Promise<void>}
     */
    public async checkExistsWithId(id: number | PatternDocumentModel, isNot?: boolean): Promise<void> {
        const isExists: boolean = await this.isExistsWithId(id);

        if (isNot) {
            if (isExists) {
                throw {
                    statusCode: ResponseStatusCode.BAD_REQUEST,
                    cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_2, value: [PatternWording.PTN_2] },
                    message: {
                        wording: CommonServiceWording.MESSAGE.MSG_CM_SER_2,
                        value: [PatternWording.PTN_2, PatternWording.PTN_1, id],
                    },
                };
            }
        } else if (!isExists) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_1, value: [PatternWording.PTN_2] },
                message: {
                    wording: CommonServiceWording.MESSAGE.MSG_CM_SER_1,
                    value: [PatternWording.PTN_2, PatternWording.PTN_1, id],
                },
            };
        }
    }

    /**
     * @param {string} sourceUrl
     *
     * @return {boolean}
     */
    public async isExistsWithSourceUrl(sourceUrl: string): Promise<boolean> {
        const result: number = await PatternModel.countDocuments({
            sourceUrl,
        }).exec();

        return result !== 0;
    }

    /**
     * @param {string} sourceUrl
     * @param {boolean | undefined} isNot
     *
     * @return {Promise<void>}
     */
    public async checkExistsWithSourceUrl(sourceUrl: string, isNot?: boolean): Promise<void> {
        const isExists: boolean = await this.isExistsWithSourceUrl(sourceUrl);

        if (isNot) {
            if (isExists) {
                throw {
                    statusCode: ResponseStatusCode.BAD_REQUEST,
                    cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_2, value: [PatternWording.PTN_2] },
                    message: {
                        wording: CommonServiceWording.MESSAGE.MSG_CM_SER_2,
                        value: [PatternWording.PTN_2, PatternWording.PTN_3, sourceUrl],
                    },
                };
            }
        } else if (!isExists) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_1, value: [PatternWording.PTN_2] },
                message: {
                    wording: CommonServiceWording.MESSAGE.MSG_CM_SER_1,
                    value: [PatternWording.PTN_2, PatternWording.PTN_3, sourceUrl],
                },
            };
        }
    }

    /**
     * @param {PatternDocumentModel}
     *
     * @return {PatternApiModel}
     */
    public convertToApiResponse({
        _id,
        sourceUrl,
        mainLocator,
        subLocator,
        cTime,
        mTime,
    }: PatternDocumentModel): PatternApiModel {
        return {
            id: _id ?? null,
            sourceUrl: sourceUrl ?? null,
            mainLocator: mainLocator ?? null,
            subLocator: subLocator ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

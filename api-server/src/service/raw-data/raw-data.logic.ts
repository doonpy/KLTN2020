import { DocumentQuery, Query } from 'mongoose';
import RawDataModel from './raw-data.model';
import RawDataConstant from './raw-data.constant';
import ResponseStatusCode from '../../common/common.response-status.code';
import { DetailUrlDocumentModel } from '../detail-url/detail-url.interface';
import { CoordinateDocumentModel } from '../coordinate/coordinate.interface';
import CoordinateLogic from '../coordinate/coordinate.logic';
import DetailUrlLogic from '../detail-url/detail-url.logic';
import { RawDataApiModel, RawDataDocumentModel, RawDataLogicInterface } from './raw-data.interface';
import CommonServiceLogicBase from '../../common/service/common.service.logic.base';
import RawDataWording from './raw-data.wording';
import CommonServiceWording from '../../common/service/common.service.wording';

export default class RawDataLogic extends CommonServiceLogicBase implements RawDataLogicInterface {
    private static instance: RawDataLogic;

    /**
     * @return {RawDataLogic}
     */
    public static getInstance(): RawDataLogic {
        if (!this.instance) {
            this.instance = new RawDataLogic();
        }

        return this.instance;
    }

    /**
     * @param {number | undefined} limit
     * @param {number | undefined} offset
     * @param {object | undefined} conditions
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<{ documents: RawDataDocumentModel[]; hasNext: boolean }>}
     */
    public async getAll(
        limit?: number,
        offset?: number,
        conditions?: object,
        isPopulate?: boolean
    ): Promise<{ documents: RawDataDocumentModel[]; hasNext: boolean }> {
        let documentQuery: DocumentQuery<RawDataDocumentModel[], RawDataDocumentModel, {}> = RawDataModel.find(
            conditions || {}
        );
        const remainQuery: Query<number> = RawDataModel.countDocuments(conditions || {});

        if (isPopulate) {
            documentQuery = this.addPopulateQuery(documentQuery) as DocumentQuery<
                RawDataDocumentModel[],
                RawDataDocumentModel,
                {}
            >;
        }

        if (offset) {
            documentQuery.skip(offset);
            remainQuery.skip(offset);
        }

        if (limit) {
            documentQuery.limit(limit);
        }

        const rawDataset: RawDataDocumentModel[] = await documentQuery.exec();
        const remainRawDataset = await remainQuery.exec();

        return {
            documents: rawDataset,
            hasNext: rawDataset.length < remainRawDataset,
        };
    }

    /**
     * @param {number} id
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<RawDataDocumentModel>}
     */
    public async getById(id: number, isPopulate?: boolean): Promise<RawDataDocumentModel> {
        let query: DocumentQuery<RawDataDocumentModel | null, RawDataDocumentModel> = RawDataModel.findById(id);
        if (isPopulate) {
            query = this.addPopulateQuery(query) as DocumentQuery<RawDataDocumentModel | null, RawDataDocumentModel>;
        }

        return (await query.exec()) as RawDataDocumentModel;
    }

    /**
     * @param {RawDataDocumentModel} body
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<RawDataDocumentModel>}
     */
    public async create(
        {
            detailUrlId,
            transactionType,
            propertyType,
            postDate,
            title,
            describe,
            price,
            acreage,
            address,
            others,
            coordinate,
        }: RawDataDocumentModel,
        isPopulate?: boolean
    ): Promise<RawDataDocumentModel> {
        const createdDoc: RawDataDocumentModel = await new RawDataModel({
            detailUrlId,
            transactionType,
            propertyType,
            postDate,
            title,
            describe,
            price,
            acreage,
            address,
            others,
            coordinate: coordinate ?? null,
            isGrouped: false,
        }).save();
        if (isPopulate) {
            return await this.getPopulateDocument(createdDoc);
        }

        return createdDoc;
    }

    /**
     * @param {number} id
     * @param {RawDataDocumentModel} requestBody
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<RawDataDocumentModel>}
     */
    public async update(
        id: number,
        {
            detailUrlId,
            transactionType,
            propertyType,
            postDate,
            title,
            describe,
            price,
            acreage,
            address,
            coordinate,
            others,
            isGrouped,
        }: RawDataDocumentModel,
        isPopulate?: boolean
    ): Promise<RawDataDocumentModel> {
        const rawData: RawDataDocumentModel = await this.getById(id);

        rawData.detailUrlId = detailUrlId || rawData.detailUrlId;
        rawData.transactionType = transactionType ?? rawData.transactionType;
        rawData.propertyType = propertyType ?? rawData.propertyType;
        rawData.postDate = postDate || rawData.postDate;
        rawData.title = title || rawData.title;
        rawData.describe = describe || rawData.describe;

        if (price && Object.keys(price).length > 0) {
            rawData.price.value = price.value || rawData.price.value;
            rawData.price.currency = price.currency || rawData.price.currency;
        }

        if (acreage && Object.keys(acreage).length > 0) {
            rawData.acreage.value = acreage.value || rawData.acreage.value;
            rawData.acreage.measureUnit = acreage.measureUnit || rawData.acreage.measureUnit;
        }

        rawData.address = address || rawData.address;
        rawData.coordinate = coordinate || rawData.coordinate;

        if (others && others.length > 0) {
            others.forEach((other: { name: string; value: string }): void => {
                if (!rawData) {
                    return;
                }

                const otherSimilarIndex = rawData.others.findIndex((o: { name: string; value: string }): boolean => {
                    return o.name === other.name;
                });
                if (otherSimilarIndex >= 0) {
                    rawData.others[otherSimilarIndex] = other;
                }
            });
        }

        rawData.isGrouped = isGrouped ?? rawData.isGrouped;

        if (isPopulate) {
            return await this.getPopulateDocument(await rawData.save());
        }

        return await rawData.save();
    }

    /**
     * @param {number} id
     *
     * @return {Promise<void>}
     */
    public async delete(id: number): Promise<void> {
        await RawDataModel.findByIdAndDelete(id).exec();
    }

    /**
     * @param {string} propertyTypeData
     *
     * @return {number} index
     */
    public getPropertyTypeIndex(propertyTypeData: string): number {
        let propertyType: number = RawDataConstant.PROPERTY_TYPE[12].id;
        const index: number = RawDataConstant.PROPERTY_TYPE.findIndex(({ wording }) =>
            new RegExp(wording.join('|')).test(propertyTypeData.toLowerCase())
        );

        if (index !== -1) {
            propertyType = index;
        }

        return propertyType;
    }

    /**
     * @param {number} id
     *
     * @return {Promise<boolean>}
     */
    public async isExistsWithId(id: number | RawDataDocumentModel): Promise<boolean> {
        if (typeof id === 'object') {
            id = id._id;
        }
        const result: number = await RawDataModel.countDocuments({
            _id: id,
        }).exec();

        return result !== 0;
    }

    /**
     * @param {number | DetailUrlDocumentModel} detailUrlId
     *
     * @return {Promise<boolean >}
     */
    public async isExistsWithDetailUrlId(detailUrlId: number | DetailUrlDocumentModel): Promise<boolean> {
        if (typeof detailUrlId === 'object') {
            detailUrlId = detailUrlId._id;
        }
        const result: number = await RawDataModel.countDocuments({
            detailUrlId,
        }).exec();

        return result !== 0;
    }

    /**
     * @param {number | RawDataDocumentModel} id
     * @param {boolean | undefined} isNot
     *
     * @return {Promise<void>}
     */
    public async checkExistsWithId(id: RawDataDocumentModel | number, isNot?: boolean): Promise<void> {
        const isExists: boolean = await this.isExistsWithId(id);

        if (isNot) {
            if (isExists) {
                throw {
                    statusCode: ResponseStatusCode.BAD_REQUEST,
                    cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_2, value: [RawDataWording.RWD_2] },
                    message: {
                        wording: CommonServiceWording.MESSAGE.MSG_CM_SER_2,
                        value: [RawDataWording.RWD_2, RawDataWording.RWD_1, id],
                    },
                };
            }
        } else if (!isExists) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_1, value: [RawDataWording.RWD_2] },
                message: {
                    wording: CommonServiceWording.MESSAGE.MSG_CM_SER_1,
                    value: [RawDataWording.RWD_2, RawDataWording.RWD_1, id],
                },
            };
        }
    }

    /**
     * @param {number | DetailUrlDocumentModel} detailUrlId
     * @param {boolean | undefined} isNot
     *
     * @return {Promise<void>}
     */
    public async checkExistsWithDetailUrlId(
        detailUrlId: DetailUrlDocumentModel | number,
        isNot?: boolean
    ): Promise<void> {
        const isExists: boolean = await this.isExistsWithDetailUrlId(detailUrlId);

        if (isNot) {
            if (isExists) {
                throw {
                    statusCode: ResponseStatusCode.BAD_REQUEST,
                    cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_2, value: [RawDataWording.RWD_2] },
                    message: {
                        wording: CommonServiceWording.MESSAGE.MSG_CM_SER_2,
                        value: [RawDataWording.RWD_2, RawDataWording.RWD_3, detailUrlId],
                    },
                };
            }
        } else if (!isExists) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_1, value: [RawDataWording.RWD_2] },
                message: {
                    wording: CommonServiceWording.MESSAGE.MSG_CM_SER_1,
                    value: [RawDataWording.RWD_2, RawDataWording.RWD_3, detailUrlId],
                },
            };
        }
    }

    /**
     * @param {DocumentQuery<RawDataDocumentModel | RawDataDocumentModel[] | null, RawDataDocumentModel, {}>} query
     *
     * @return {DocumentQuery<RawDataDocumentModel | RawDataDocumentModel[] | null, RawDataDocumentModel, {}>}
     */
    public addPopulateQuery(
        query: DocumentQuery<RawDataDocumentModel | RawDataDocumentModel[] | null, RawDataDocumentModel, {}>
    ): DocumentQuery<RawDataDocumentModel | RawDataDocumentModel[] | null, RawDataDocumentModel, {}> {
        return query.populate({
            path: 'detailUrlId coordinateId',
            populate: {
                path: 'catalogId',
                populate: { path: 'hostId patternId' },
            },
        });
    }

    /**
     * @param {RawDataDocumentModel} document
     *
     * @return {Promise<RawDataDocumentModel>}
     */
    public async getPopulateDocument(document: RawDataDocumentModel): Promise<RawDataDocumentModel> {
        return await document
            .populate({
                path: 'detailUrlId coordinateId',
                populate: {
                    path: 'catalogId',
                    populate: { path: 'hostId patternId' },
                },
            })
            .execPopulate();
    }

    /**
     * @param {RawDataDocumentModel}
     * @param {number} languageIndex
     *
     * @return {RawDataApiModel}
     */

    public convertToApiResponse(
        {
            _id,
            transactionType,
            propertyType,
            detailUrlId,
            postDate,
            title,
            describe,
            price,
            acreage,
            address,
            others,
            coordinate,
            isGrouped,
            cTime,
            mTime,
        }: RawDataDocumentModel,
        languageIndex = 0
    ): RawDataApiModel {
        return {
            id: _id ?? null,
            transactionType: RawDataConstant.TRANSACTION_TYPE[transactionType].wording[languageIndex] ?? null,
            propertyType: RawDataConstant.PROPERTY_TYPE[propertyType].wording[languageIndex] ?? null,
            detailUrl: detailUrlId
                ? DetailUrlLogic.getInstance().convertToApiResponse(detailUrlId as DetailUrlDocumentModel)
                : null,
            postDate: postDate ?? null,
            title: title ?? null,
            describe: describe ?? null,
            price: price ?? null,
            acreage: acreage ?? null,
            address: address ?? null,
            others: others ?? null,
            coordinate: coordinate
                ? CoordinateLogic.getInstance().convertToApiResponse(coordinate as CoordinateDocumentModel)
                : null,
            isGrouped: isGrouped ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

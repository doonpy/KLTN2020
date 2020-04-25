import { Document } from 'mongoose';
import { Router } from 'express';

export interface CommonDocumentModel extends Document {
    _id: number;
    cTime: string;
    mTime: string;
}

export interface CommonApiModel {
    id: number | null;
    createAt: string | null;
    updateAt: string | null;
}

export interface CommonLogicBaseInterface {
    /**
     * @param {number | undefined} limit
     * @param {number | undefined} offset
     * @param {object | undefined} conditions
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<{ documents: CommonDocumentModel[]; hasNext: boolean }>}
     */
    getAll(
        limit?: number,
        offset?: number,
        conditions?: object,
        isPopulate?: boolean
    ): Promise<{ documents: CommonDocumentModel[]; hasNext: boolean }>;

    /**
     * @param {number} id
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<CommonDocumentModel>}
     */
    getById(id: number, isPopulate?: boolean): Promise<CommonDocumentModel>;

    /**
     * @param {CommonDocumentModel} input
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<CommonDocumentModel>}
     */
    create(input: CommonDocumentModel, isPopulate?: boolean): Promise<CommonDocumentModel>;

    /**
     * @param {number} id
     * @param {CommonDocumentModel} input
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<CommonDocumentModel>}
     */
    update(id: number, input: CommonDocumentModel, isPopulate?: boolean): Promise<CommonDocumentModel>;

    /**
     * @param {number} id
     *
     * @return {Promise<void>}
     */
    delete(id: number): Promise<void>;

    /**
     * @param {number | CommonDocumentModel} id
     *
     * @return {Promise<boolean>}
     */
    isExistsWithId(id: number | CommonDocumentModel): Promise<boolean>;

    /**
     * @param {number | CommonDocumentModel} id
     * @param {boolean | undefined} isNot
     *
     * @return {Promise<void>}
     */
    checkExistsWithId(id: number | CommonDocumentModel, isNot?: boolean): Promise<void>;

    /**
     * @param {CommonDocumentModel} input
     * @param {number} languageIndex
     *
     * @return {CommonApiModel}
     */
    convertToApiResponse(input: CommonDocumentModel, languageIndex: number): CommonApiModel;
}

export interface CommonServiceControllerBaseInterface {
    router: Router;
}

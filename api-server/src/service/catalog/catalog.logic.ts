import CommonLogicBase from '@common/service/common.service.logic.base';
import CatalogModel from './catalog.model';
import { CatalogApiModel, CatalogDocumentModel } from './catalog.interface';
import { HostApiModel, HostDocumentModel } from '../host/host.interface';
import {
    PatternApiModel,
    PatternDocumentModel,
} from '../pattern/pattern.interface';
import HostLogic from '../host/host.logic';
import PatternLogic from '../pattern/pattern.logic';

export default class CatalogLogic extends CommonLogicBase<
    CatalogDocumentModel,
    CatalogApiModel
> {
    public static instance: CatalogLogic;

    constructor() {
        super(CatalogModel);
    }

    /**
     * @return {CatalogLogic}
     */
    public static getInstance(): CatalogLogic {
        if (!this.instance) {
            this.instance = new CatalogLogic();
        }
        return this.instance;
    }

    /**
     * @param {CatalogDocumentModel}
     *
     * @return {CatalogApiModel}
     */
    public convertToApiResponse({
        _id,
        title,
        url,
        locator,
        hostId,
        patternId,
        cTime,
        mTime,
    }: CatalogDocumentModel): CatalogApiModel {
        let host: HostApiModel | number | null = null;
        let pattern: PatternApiModel | number | null = null;

        if (hostId) {
            if (typeof hostId === 'object') {
                host = HostLogic.getInstance().convertToApiResponse(
                    hostId as HostDocumentModel
                );
            } else {
                host = hostId as number;
            }
        }

        if (patternId) {
            if (typeof patternId === 'object') {
                pattern = PatternLogic.getInstance().convertToApiResponse(
                    patternId as PatternDocumentModel
                );
            } else {
                pattern = patternId as number;
            }
        }

        return {
            id: _id ?? null,
            title: title ?? null,
            url: url ?? null,
            locator: locator ?? null,
            host,
            pattern,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

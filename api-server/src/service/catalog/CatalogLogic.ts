import CommonLogicBase from '@service/ServiceLogicBase';
import Model from './model';
import { CatalogApiModel, CatalogDocumentModel } from './interface';
import { HostApiModel, HostDocumentModel } from '../host/interface';
import { PatternApiModel, PatternDocumentModel } from '../pattern/interface';
import HostLogic from '../host/HostLogic';
import PatternLogic from '../pattern/PatternLogic';

export default class CatalogLogic extends CommonLogicBase<
    CatalogDocumentModel,
    CatalogApiModel
> {
    public static instance: CatalogLogic;

    constructor() {
        super(Model);
    }

    public static getInstance(): CatalogLogic {
        if (!this.instance) {
            this.instance = new CatalogLogic();
        }
        return this.instance;
    }

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

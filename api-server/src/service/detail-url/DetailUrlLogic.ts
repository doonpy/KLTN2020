import CommonServiceLogicBase from '@common/service/CommonServiceLogicBase';
import Model from './model';
import { CatalogApiModel, CatalogDocumentModel } from '../catalog/interface';
import { DetailUrlApiModel, DetailUrlDocumentModel } from './interface';
import CatalogLogic from '../catalog/CatalogLogic';

export default class DetailUrlLogic extends CommonServiceLogicBase<
    DetailUrlDocumentModel,
    DetailUrlApiModel
> {
    private static instance: DetailUrlLogic;

    constructor() {
        super(Model);
    }

    /**
     * @return {DetailUrlLogic}
     */
    public static getInstance(): DetailUrlLogic {
        if (!this.instance) {
            this.instance = new DetailUrlLogic();
        }

        return this.instance;
    }

    /**
     * @param {DetailUrlDocumentModel}
     *
     * @return {DetailUrlApiModel}
     */
    public convertToApiResponse({
        _id,
        catalogId,
        url,
        isExtracted,
        requestRetries,
        cTime,
        mTime,
    }: DetailUrlDocumentModel): DetailUrlApiModel {
        let catalog: CatalogApiModel | number | null = null;

        if (catalogId) {
            if (typeof catalogId === 'object') {
                catalog = CatalogLogic.getInstance().convertToApiResponse(
                    catalogId as CatalogDocumentModel
                );
            } else {
                catalog = catalogId as number;
            }
        }

        return {
            id: _id ?? null,
            catalog,
            url: url ?? null,
            isExtracted: isExtracted ?? null,
            requestRetries: requestRetries ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

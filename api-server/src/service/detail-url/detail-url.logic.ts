import CommonServiceLogicBase from '@common/service/common.service.logic.base';
import DetailUrlModel from './detail-url.model';
import { CatalogApiModel, CatalogDocumentModel } from '../catalog/catalog.interface';
import { DetailUrlApiModel, DetailUrlDocumentModel, DetailUrlLogicInterface } from './detail-url.interface';
import CatalogLogic from '../catalog/catalog.logic';

export default class DetailUrlLogic extends CommonServiceLogicBase<DetailUrlDocumentModel, DetailUrlApiModel>
    implements DetailUrlLogicInterface {
    private static instance: DetailUrlLogic;

    constructor() {
        super(DetailUrlModel);
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
     * @param {object[]} aggregations
     *
     * @return {Promise<any[]>}
     */
    public async aggregationQuery(aggregations: object[]): Promise<object[]> {
        return DetailUrlModel.aggregate(aggregations).allowDiskUse(true).exec();
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
                catalog = CatalogLogic.getInstance().convertToApiResponse(catalogId as CatalogDocumentModel);
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

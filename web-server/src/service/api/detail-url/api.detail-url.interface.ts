import { CommonApiModel } from '../../common/service/common.service.interface';
import { CatalogApiModel } from '../catalog/api.catalog.interface';

export interface DetailUrlApiModel extends CommonApiModel {
    catalog: CatalogApiModel | number | null;
    url: string | null;
    isExtracted: boolean | null;
    requestRetries: number | null;
}

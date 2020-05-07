import { CommonApiModel } from '../../common/service/common.service.interface';
import { HostApiModel } from '../host/api.host.interface';
import { PatternApiModel } from '../pattern/api.pattern.interface';

export interface CatalogApiModel extends CommonApiModel {
    title: string | null;
    url: string | null;
    locator: {
        detailUrl: string;
        pageNumber: string;
    } | null;
    host: HostApiModel | number | null;
    pattern: PatternApiModel | number | null;
}

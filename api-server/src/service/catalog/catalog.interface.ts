import { CommonApiModel, CommonDocumentModel } from '@common/service/common.service.interface';
import { PatternApiModel, PatternDocumentModel } from '../pattern/pattern.interface';
import { HostApiModel, HostDocumentModel } from '../host/host.interface';

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

export interface CatalogDocumentModel extends CommonDocumentModel {
    title: string;
    url: string;
    locator: {
        detailUrl: string;
        pageNumber: string;
    };
    hostId: HostDocumentModel | number;
    patternId: PatternDocumentModel | number;
}

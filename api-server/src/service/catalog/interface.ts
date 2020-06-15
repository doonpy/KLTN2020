import { ApiModelBase, DocumentModelBase } from '@service/interface';
import { PatternApiModel, PatternDocumentModel } from '../pattern/interface';
import { HostApiModel, HostDocumentModel } from '../host/interface';

export interface CatalogApiModel extends ApiModelBase {
    title: string | null;
    url: string | null;
    locator: {
        detailUrl: string;
        pageNumber: string;
    } | null;
    host: HostApiModel | number | null;
    pattern: PatternApiModel | number | null;
}

export interface CatalogDocumentModel extends DocumentModelBase {
    title: string;
    url: string;
    locator: {
        detailUrl: string;
        pageNumber: string;
    };
    hostId: HostDocumentModel | number;
    patternId: PatternDocumentModel | number;
}

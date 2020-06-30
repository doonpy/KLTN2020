import {
    ApiModelBase,
    CommonRequestBodySchema,
    CommonRequestParamSchema,
    CommonRequestQuerySchema,
    DocumentModelBase,
} from '@service/interface';

export interface HostApiModel extends ApiModelBase {
    name: string | null;
    domain: string | null;
}

export interface HostDocumentModel extends DocumentModelBase {
    name: string;
    domain: string;
}

export interface HostRequestParamSchema extends CommonRequestParamSchema {}

export interface HostRequestQuerySchema extends CommonRequestQuerySchema {
    name: string;
    domain: string;
}

export interface HostRequestBodySchema extends CommonRequestBodySchema {
    name: string;
    domain: string;
}

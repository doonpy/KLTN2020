import {
    ApiModelBase,
    CommonRequestBodySchema,
    CommonRequestParamSchema,
    CommonRequestQuerySchema,
    DocumentModelBase,
} from '@service/interface';

export interface PatternPostDate {
    locator: string;
    format: string;
    delimiter: string;
}

export interface PatternMainLocator {
    propertyType: string;
    title: string;
    describe: string;
    price: string;
    acreage: string;
    address: string;
    postDate: PatternPostDate;
}

export interface PatternSubLocator {
    name: string;
    value: string;
}

export interface PatternApiModel extends ApiModelBase {
    sourceUrl: string | null;
    mainLocator: PatternMainLocator | null;
    subLocator: PatternSubLocator[] | null;
}

export interface PatternDocumentModel extends DocumentModelBase {
    sourceUrl: string;
    mainLocator: PatternMainLocator;
    subLocator: PatternSubLocator[];
}

export interface PatternRequestParamSchema extends CommonRequestParamSchema {}

export interface PatternRequestQuerySchema extends CommonRequestQuerySchema {
    sourceUrl: string;
    id: string;
    filePath: string;
}

export interface PatternRequestBodySchema extends CommonRequestBodySchema {
    sourceUrl: string;
    mainLocator: PatternMainLocator;
    subLocator: PatternSubLocator[];
}

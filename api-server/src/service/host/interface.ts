import {
    ApiModelBase,
    DocumentModelBase,
    CommonLogicBaseInterface,
} from '@service/interface';

export interface HostApiModel extends ApiModelBase {
    name: string | null;
    domain: string | null;
}

export interface HostDocumentModel extends DocumentModelBase {
    name: string;
    domain: string;
}

export interface HostLogicInterface
    extends CommonLogicBaseInterface<HostDocumentModel, HostApiModel> {
    getByDomain(domain: string): Promise<HostDocumentModel>;
}

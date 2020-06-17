import { ApiModelBase, DocumentModelBase } from '@service/interface';

export interface HostApiModel extends ApiModelBase {
    name: string | null;
    domain: string | null;
}

export interface HostDocumentModel extends DocumentModelBase {
    name: string;
    domain: string;
}

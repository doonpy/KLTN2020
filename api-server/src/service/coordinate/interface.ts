import { ApiModelBase, DocumentModelBase } from '@service/interface';

export interface CoordinateApiModel extends ApiModelBase {
    locations: string[] | null;
    lat: number | null;
    lng: number | null;
}

export interface CoordinateDocumentModel extends DocumentModelBase {
    locations: string[];
    lat: number;
    lng: number;
}

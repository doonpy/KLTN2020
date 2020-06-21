import { ApiModelBase, DocumentModelBase } from '@service/interface';

export interface VisualAnalyticsDocumentModel extends DocumentModelBase {
    month: number;
    year: number;
    transactionType: number;
    propertyType: number;
    amount: number;
    priceMax: number;
    priceMin: number;
    perMeterSum: number;
    perMeterAverage: number;
    perMeterMax: number;
    perMeterMin: number;
}

export interface VisualAnalyticsApiModel extends ApiModelBase {
    month: number | null;
    year: number | null;
    transactionType: number | null;
    propertyType: number | null;
    amount: number | null;
    priceMax: number | null;
    priceMin: number | null;
    perMeterSum: number | null;
    perMeterAverage: number | null;
    perMeterMax: number | null;
    perMeterMin: number | null;
}

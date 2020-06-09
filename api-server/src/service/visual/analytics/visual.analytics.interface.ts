import {
    CommonApiModel,
    CommonDocumentModel,
} from '@common/service/common.service.interface';

export interface AnalyticsData {
    transactionType: number;
    propertyType: number;
    summary: number;
    amount: number;
    average: number;
    max: number;
    min: number;
}

export interface VisualAnalyticsDocumentModel extends CommonDocumentModel {
    month: number;
    year: number;
    transactionType: number;
    propertyType: number;
    amount: number;
    max: number;
    min: number;
    sumAverage: number;
    average: number;
    maxAverage: number;
    minAverage: number;
}

export interface VisualAnalyticsApiModel extends CommonApiModel {
    month: number | null;
    year: number | null;
    transactionType: number | null;
    propertyType: number | null;
    amount: number | null;
    max: number | null;
    min: number | null;
    sumAverage: number | null;
    average: number | null;
    maxAverage: number | null;
    minAverage: number | null;
}

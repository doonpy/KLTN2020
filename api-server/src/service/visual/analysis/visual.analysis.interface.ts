import {
    CommonApiModel,
    CommonDocumentModel,
} from '@common/service/common.service.interface';

export interface AnalysisData {
    transactionType: number;
    propertyType: number;
    summary: number;
    amount: number;
    average: number;
    max: number;
    min: number;
}

export interface PriceAnalysisData extends AnalysisData {
    timeUnit?: string[];
}

export interface AcreageAnalysisData extends AnalysisData {
    measureUnit: string;
}

export interface VisualAnalysisDocumentModel extends CommonDocumentModel {
    referenceDate: string;
    priceAnalysisData: PriceAnalysisData[];
    acreageAnalysisData: AcreageAnalysisData[];
}

export interface VisualAnalysisApiModel extends CommonApiModel {
    referenceDate: string;
    priceAnalysisData: PriceAnalysisData[];
    acreageAnalysisData: AcreageAnalysisData[];
}

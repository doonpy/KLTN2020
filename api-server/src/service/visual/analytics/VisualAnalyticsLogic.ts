import {
    VisualAnalyticsApiModel,
    VisualAnalyticsDocumentModel,
} from '@service/visual/analytics/interface';
import ServiceLogicBase from '@service/ServiceLogicBase';
import Model from '@service/visual/analytics/model';

export default class VisualAnalyticsLogic extends ServiceLogicBase<
    VisualAnalyticsDocumentModel,
    VisualAnalyticsApiModel
> {
    public static instance: VisualAnalyticsLogic;

    constructor() {
        super(Model);
    }

    public static getInstance(): VisualAnalyticsLogic {
        if (!this.instance) {
            this.instance = new VisualAnalyticsLogic();
        }
        return this.instance;
    }

    public convertToApiResponse({
        _id,
        month,
        year,
        transactionType,
        propertyType,
        amount,
        perMeterMax,
        perMeterMin,
        perMeterSum,
        perMeterAverage,
        priceMin,
        priceMax,
        cTime,
        mTime,
    }: VisualAnalyticsDocumentModel): VisualAnalyticsApiModel {
        return {
            id: _id ?? null,
            month: month ?? null,
            year: year ?? null,
            transactionType: transactionType ?? null,
            propertyType: propertyType ?? null,
            amount: amount ?? null,
            priceMax: priceMax ?? null,
            priceMin: priceMin ?? null,
            perMeterSum: perMeterSum ?? null,
            perMeterAverage: perMeterAverage ?? null,
            perMeterMax: perMeterMax ?? null,
            perMeterMin: perMeterMin ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

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

    /**
     * @return {VisualAnalyticsLogic}
     */
    public static getInstance(): VisualAnalyticsLogic {
        if (!this.instance) {
            this.instance = new VisualAnalyticsLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualAnalyticsDocumentModel} input
     *
     * @return {VisualAnalyticsApiModel}
     */
    public convertToApiResponse({
        _id,
        month,
        year,
        transactionType,
        propertyType,
        amount,
        max,
        min,
        sumAverage,
        average,
        maxAverage,
        minAverage,
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
            max: max ?? null,
            min: min ?? null,
            sumAverage: sumAverage ?? null,
            average: average ?? null,
            maxAverage: maxAverage ?? null,
            minAverage: minAverage ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

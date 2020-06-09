import {
    VisualAnalyticsApiModel,
    VisualAnalyticsDocumentModel,
} from '@service/visual/analytics/visual.analytics.interface';
import CommonServiceLogicBase from '@common/service/common.service.logic.base';
import VisualAnalyticsModel from '@service/visual/analytics/visual.analytics.model';

export default class VisualAnalyticsLogic extends CommonServiceLogicBase<
    VisualAnalyticsDocumentModel,
    VisualAnalyticsApiModel
> {
    public static instance: VisualAnalyticsLogic;

    constructor() {
        super(VisualAnalyticsModel);
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

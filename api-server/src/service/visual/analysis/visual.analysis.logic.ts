import {
    VisualAnalysisApiModel,
    VisualAnalysisDocumentModel,
} from '@service/visual/analysis/visual.analysis.interface';
import CommonServiceLogicBase from '@common/service/common.service.logic.base';
import VisualAnalysisModel from '@service/visual/analysis/visual.analysis.model';

export default class VisualAnalysisLogic extends CommonServiceLogicBase<
    VisualAnalysisDocumentModel,
    VisualAnalysisApiModel
> {
    public static instance: VisualAnalysisLogic;

    constructor() {
        super(VisualAnalysisModel);
    }

    /**
     * @return {VisualAnalysisLogic}
     */
    public static getInstance(): VisualAnalysisLogic {
        if (!this.instance) {
            this.instance = new VisualAnalysisLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualAnalysisDocumentModel} input
     *
     * @return {VisualAnalysisApiModel}
     */
    public convertToApiResponse({
        _id,
        referenceDate,
        priceAnalysisData,
        acreageAnalysisData,
        cTime,
        mTime,
    }: VisualAnalysisDocumentModel): VisualAnalysisApiModel {
        return {
            id: _id ?? null,
            referenceDate: referenceDate ?? null,
            priceAnalysisData: priceAnalysisData ?? null,
            acreageAnalysisData: acreageAnalysisData ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

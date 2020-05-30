import { VisualCommonLogicInterface } from '@service/visual/visual.common.interface';
import {
    VisualAnalysisApiModel,
    VisualAnalysisDocumentModel,
} from '@service/visual/analysis/visual.analysis.interface';

export default class VisualAnalysisLogic implements VisualCommonLogicInterface {
    public static instance: VisualAnalysisLogic;

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

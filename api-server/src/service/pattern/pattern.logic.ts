import CommonServiceLogicBase from '@common/service/common.service.logic.base';
import PatternModel from './pattern.model';
import { PatternApiModel, PatternDocumentModel } from './pattern.interface';

export default class PatternLogic extends CommonServiceLogicBase<
    PatternDocumentModel,
    PatternApiModel
> {
    public static instance: PatternLogic;

    constructor() {
        super(PatternModel);
    }

    /**
     * @return {PatternLogic}
     */
    public static getInstance(): PatternLogic {
        if (!this.instance) {
            this.instance = new PatternLogic();
        }

        return this.instance;
    }

    /**
     * @param {PatternDocumentModel}
     *
     * @return {PatternApiModel}
     */
    public convertToApiResponse({
        _id,
        sourceUrl,
        mainLocator,
        subLocator,
        cTime,
        mTime,
    }: PatternDocumentModel): PatternApiModel {
        return {
            id: _id ?? null,
            sourceUrl: sourceUrl ?? null,
            mainLocator: mainLocator ?? null,
            subLocator: subLocator ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

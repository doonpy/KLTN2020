import ServiceLogicBase from '@service/ServiceLogicBase';
import Model from './model';
import { PatternApiModel, PatternDocumentModel } from './interface';

export default class PatternLogic extends ServiceLogicBase<
    PatternDocumentModel,
    PatternApiModel
> {
    public static instance: PatternLogic;

    constructor() {
        super(Model);
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

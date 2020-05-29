import { VisualDistrictApiModel } from '../district/visual.district.interface';
import { VisualWardApiModel, VisualWardDocumentModel, VisualWardLogicInterface } from './visual.ward.interface';
import VisualDistrictLogic from '../district/visual.district.logic';

export default class VisualWardLogic implements VisualWardLogicInterface {
    public static instance: VisualWardLogic;

    /**
     * @return {VisualizationSummaryDistrictLogic}
     */
    public static getInstance(): VisualWardLogic {
        if (!this.instance) {
            this.instance = new VisualWardLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualWardDocumentModel} document
     *
     * @return {VisualWardDocumentModel}
     */
    public async populateDocument(document: VisualWardDocumentModel): Promise<VisualWardDocumentModel> {
        return document.populate({ path: 'districtId', populate: { path: 'provinceId' } }).execPopulate();
    }

    /**
     * @param {VisualWardDocumentModel} input
     *
     * @return {VisualWardApiModel}
     */
    public convertToApiResponse({
        _id,
        name,
        code,
        districtId,
        cTime,
        mTime,
    }: VisualWardDocumentModel): VisualWardApiModel {
        let district: VisualDistrictApiModel | number | null = null;

        if (districtId) {
            if (typeof districtId === 'object') {
                district = VisualDistrictLogic.getInstance().convertToApiResponse(districtId);
            } else {
                district = districtId;
            }
        }

        return {
            id: _id ?? null,
            name: name ?? null,
            code: code ?? null,
            district,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

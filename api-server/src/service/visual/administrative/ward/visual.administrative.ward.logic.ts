import VisualAdministrativeWardModel from '@service/visual/administrative/ward/visual.administrative.ward.model';
import CommonServiceLogicBase from '@common/service/common.service.logic.base';
import { VisualAdministrativeDistrictApiModel } from '../district/visual.administrative.district.interface';
import {
    VisualAdministrativeWardApiModel,
    VisualAdministrativeWardDocumentModel,
} from './visual.administrative.ward.interface';
import VisualAdministrativeDistrictLogic from '../district/visual.administrative.district.logic';

export default class VisualAdministrativeWardLogic extends CommonServiceLogicBase<
    VisualAdministrativeWardDocumentModel,
    VisualAdministrativeWardApiModel
> {
    public static instance: VisualAdministrativeWardLogic;

    constructor() {
        super(VisualAdministrativeWardModel);
    }

    /**
     * @return {VisualAdministrativeWardLogic}
     */
    public static getInstance(): VisualAdministrativeWardLogic {
        if (!this.instance) {
            this.instance = new VisualAdministrativeWardLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualAdministrativeWardDocumentModel} document
     *
     * @return {VisualAdministrativeWardDocumentModel}
     */
    public async populateDocument(
        document: VisualAdministrativeWardDocumentModel
    ): Promise<VisualAdministrativeWardDocumentModel> {
        return document.populate({ path: 'districtId', populate: { path: 'provinceId' } }).execPopulate();
    }

    /**
     * @param {VisualAdministrativeWardDocumentModel} input
     *
     * @return {VisualAdministrativeWardApiModel}
     */
    public convertToApiResponse({
        _id,
        name,
        code,
        districtId,
        cTime,
        mTime,
    }: VisualAdministrativeWardDocumentModel): VisualAdministrativeWardApiModel {
        let district: VisualAdministrativeDistrictApiModel | number | null = null;

        if (districtId) {
            if (typeof districtId === 'object') {
                district = VisualAdministrativeDistrictLogic.getInstance().convertToApiResponse(districtId);
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

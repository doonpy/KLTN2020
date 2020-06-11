import CommonServiceLogicBase from '@service/CommonServiceLogicBase';
import Model from './model';
import {
    CoordinateApiModel,
    CoordinateDocumentModel,
    CoordinateLogicInterface,
} from './interface';

export default class CoordinateLogic
    extends CommonServiceLogicBase<CoordinateDocumentModel, CoordinateApiModel>
    implements CoordinateLogicInterface {
    private static instance: CoordinateLogic;

    constructor() {
        super(Model);
    }

    /**
     * @return {CoordinateLogic}
     */
    public static getInstance(): CoordinateLogic {
        if (!this.instance) {
            this.instance = new CoordinateLogic();
        }

        return this.instance;
    }

    /**
     * @param {string} location
     *
     * @return Promise<CoordinateDocumentModel>
     */
    public async getByLocation(
        location: string
    ): Promise<CoordinateDocumentModel> {
        return (await Model.findOne({
            location: location.trim(),
        }).exec()) as CoordinateDocumentModel;
    }

    /**
     * @param {CoordinateDocumentModel}
     *
     * @return {CoordinateApiModel}
     */
    public convertToApiResponse({
        _id,
        location,
        lat,
        lng,
        cTime,
        mTime,
    }: CoordinateDocumentModel): CoordinateApiModel {
        return {
            id: _id ?? null,
            location: location ?? null,
            lat: lat ?? null,
            lng: lng ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

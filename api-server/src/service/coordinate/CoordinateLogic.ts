import ServiceLogicBase from '@service/ServiceLogicBase';
import Model from './model';
import { CoordinateApiModel, CoordinateDocumentModel } from './interface';

export default class CoordinateLogic extends ServiceLogicBase<
    CoordinateDocumentModel,
    CoordinateApiModel
> {
    private static instance: CoordinateLogic;

    constructor() {
        super(Model);
    }

    public static getInstance(): CoordinateLogic {
        if (!this.instance) {
            this.instance = new CoordinateLogic();
        }

        return this.instance;
    }

    public convertToApiResponse({
        _id,
        locations,
        lat,
        lng,
        cTime,
        mTime,
    }: CoordinateDocumentModel): CoordinateApiModel {
        return {
            id: _id ?? null,
            locations: locations ?? null,
            lat: lat ?? null,
            lng: lng ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

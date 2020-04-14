import LogicBase from '../logic.base';
import CoordinateModel from './coordinate.model';
import CoordinateModelInterface from './coordinate.model.interface';
import ExternalApi from '../../util/external-api/external-api';
import { Exception } from '../exception/exception.index';
import { Database } from '../database/database.index';
import CoordinateApiInterface from './coordinate.api.interface';
import { ResponseStatusCode } from '../../common/common.response-status.code';

export default class CoordinateLogic extends LogicBase {
    /**
     * @param location
     * @return Promise<CoordinateModelInterface>
     */
    public async create(location: string): Promise<CoordinateModelInterface | null> {
        try {
            location = location.trim();
            const isExisted: CoordinateModelInterface | null = await CoordinateModel.findOne({ location });
            if (isExisted) {
                return isExisted;
            }
            const externalApiInstance: ExternalApi = ExternalApi.getInstance();
            const {
                lat,
                lng,
            }: {
                lat: number;
                lng: number;
            } = await externalApiInstance.getCoordinateFromAddress(location);
            if (!lat || !lng) {
                return null;
            }
            return await new CoordinateModel({ location, lat, lng }).save();
        } catch (error) {
            throw new Exception.Customize(
                error.statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param _id
     * @param location
     * @param lat
     * @param lng
     * @param cTime
     * @param mTime
     * @return {CoordinateApiInterface} data
     */
    public static convertToResponse({
        _id,
        location,
        lat,
        lng,
        cTime,
        mTime,
    }: CoordinateModelInterface): CoordinateApiInterface {
        const data: CoordinateApiInterface = {
            id: null,
            location: null,
            lat: null,
            lng: null,
            createAt: null,
            updateAt: null,
        };

        if (_id) {
            data.id = _id;
        }

        if (location) {
            data.location = location;
        }

        if (lat) {
            data.lat = lat;
        }

        if (lng) {
            data.lng = lng;
        }

        if (cTime) {
            data.createAt = cTime;
        }

        if (mTime) {
            data.updateAt = mTime;
        }

        return data;
    }
}

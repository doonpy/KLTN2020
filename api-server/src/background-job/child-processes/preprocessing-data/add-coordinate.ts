import { CoordinateDocumentModel } from '@service/coordinate/interface';
import { getGeocodeByBingMap } from '@util/external-api/map';
import CoordinateLogic from '@service/coordinate/CoordinateLogic';
import { RawDataDocumentModel } from '@service/raw-data/interface';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import RawDataLogic from '@service/raw-data/RawDataLogic';
import {
    DOCUMENT_LIMIT,
    MAX_PROCESS,
} from '@background-job/child-processes/preprocessing-data/constant';

const rawDataLogic = RawDataLogic.getInstance();

/**
 * Get coordinate of certain address
 */
const getCoordinate = async (
    address: string
): Promise<CoordinateDocumentModel | undefined> => {
    const coordinateLogic = CoordinateLogic.getInstance();
    let coordinateDoc = await coordinateLogic.getOne({ locations: address });
    if (!coordinateDoc) {
        const apiResponse = await getGeocodeByBingMap(address);
        if (!apiResponse) {
            return undefined;
        }

        if (
            !apiResponse.resourceSets ||
            apiResponse.resourceSets.length === 0
        ) {
            return undefined;
        }

        if (
            !apiResponse.resourceSets[0] ||
            apiResponse.resourceSets[0].resources.length === 0
        ) {
            return undefined;
        }

        const [
            lat,
            lng,
        ] = apiResponse.resourceSets[0].resources[0].point.coordinates;

        const similarCoordinateDoc = await coordinateLogic.getOne({ lat, lng });
        if (similarCoordinateDoc) {
            similarCoordinateDoc.locations.push(address);
            coordinateDoc = await similarCoordinateDoc.save();
        } else {
            coordinateDoc = await coordinateLogic.create({
                locations: [address],
                lat,
                lng,
            } as CoordinateDocumentModel);
        }
    }

    return coordinateDoc;
};

/**
 * @param rawData
 * @private
 */
const _addCoordinatePhase = async (
    rawData: RawDataDocumentModel
): Promise<void> => {
    try {
        const coordinate = await getCoordinate(rawData.address);
        if (!coordinate) {
            new ConsoleLog(
                ConsoleConstant.Type.ERROR,
                `Preprocessing data - Add coordinate - RID: ${rawData._id} - Can't get coordinate of this address - ${rawData.address}`
            ).show();
            await rawDataLogic.delete(rawData._id);
            return;
        }

        rawData.coordinateId = coordinate._id;
        await rawData.save();
        new ConsoleLog(
            ConsoleConstant.Type.INFO,
            `Preprocessing data - Add coordinate - RID: ${rawData._id}`
        ).show();
    } catch (error) {
        new ConsoleLog(
            ConsoleConstant.Type.ERROR,
            `Preprocessing data - Add coordinate - RID: ${rawData._id} - Error: ${error.message}`
        ).show();
    }
};

/**
 * Add coordinate phase
 */
export const addCoordinatePhase = async (
    script: AsyncGenerator
): Promise<void> => {
    let processCounter = 0;
    let documents: RawDataDocumentModel[] = (
        await rawDataLogic.getAll({
            limit: DOCUMENT_LIMIT,
            conditions: {
                coordinateId: null,
            },
        })
    ).documents;

    const loop = setInterval(async (): Promise<void> => {
        if (documents.length === 0 && processCounter === 0) {
            clearInterval(loop);
            script.next();
            return;
        }

        if (processCounter > MAX_PROCESS) {
            return;
        }

        const targetRawData = documents.shift();
        if (!targetRawData) {
            return;
        }
        if (documents.length === 0) {
            documents = (
                await rawDataLogic.getAll({
                    limit: DOCUMENT_LIMIT,
                    conditions: {
                        coordinateId: null,
                    },
                })
            ).documents;
        }

        processCounter++;
        await _addCoordinatePhase(targetRawData);
        processCounter--;
    }, 0);
};

import { RawDataDocumentModel } from '@service/raw-data/interface';
import {
    MapPoint,
    VisualMapPointDocumentModel,
} from '@service/visual/map-point/interface';
import CommonConstant from '@common/constant';
import VisualMapPointLogic from '@service/visual/map-point/VisualMapPointLogic';
import { CoordinateDocumentModel } from '@service/coordinate/interface';
import RawDataLogic from '@service/raw-data/RawDataLogic';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import { DOCUMENT_LIMIT } from '@background-job/child-processes/preprocessing-data/constant';
import { getDistrictIdAndWardId } from '@background-job/child-processes/preprocessing-data/helper';

const rawDataLogic = RawDataLogic.getInstance();

/**
 * Add visualization data for map point
 *
 * @param {number} districtId
 * @param {number} wardId
 * @param {RawDataDocumentModel} rawData
 */
const handleVisualizationMapPoint = async (
    districtId: number,
    wardId: number,
    {
        _id,
        acreage,
        price,
        transactionType,
        propertyType,
        coordinateId,
    }: RawDataDocumentModel
): Promise<void> => {
    const visualMapPointLogic = VisualMapPointLogic.getInstance();
    const { lat, lng } = coordinateId as CoordinateDocumentModel;
    const visualMapPointDocument = await visualMapPointLogic.getOne({
        lat,
        lng,
    });

    const newPoint: MapPoint = {
        rawDataId: _id,
        acreage: acreage.value,
        price: price.value,
        currency: price.currency,
    };
    if (transactionType === CommonConstant.TRANSACTION_TYPE[1].id) {
        newPoint.timeUnit =
            CommonConstant.PRICE_TIME_UNIT[price.timeUnit].wording;
    }

    if (!visualMapPointDocument) {
        await visualMapPointLogic.create({
            districtId,
            wardId,
            lat,
            lng,
            points: [
                {
                    rawDataset: [newPoint],
                    transactionType,
                    propertyType,
                },
            ],
        } as VisualMapPointDocumentModel);
        return;
    }

    const pointsIndex = visualMapPointDocument.points.findIndex(
        ({
            transactionType: pointTransactionType,
            propertyType: pointPropertyType,
        }) =>
            transactionType === pointTransactionType &&
            propertyType === pointPropertyType
    );
    if (pointsIndex === -1) {
        visualMapPointDocument.points.push({
            rawDataset: [newPoint],
            transactionType,
            propertyType,
        });
    } else {
        visualMapPointDocument.points[pointsIndex].rawDataset.push(newPoint);
    }

    await visualMapPointDocument.save();
};

/**
 * Map point phase
 */
export const mapPointPhase = async (script: AsyncGenerator): Promise<void> => {
    let documents = (
        await rawDataLogic.getAll({
            limit: DOCUMENT_LIMIT,
            conditions: {
                'status.isMapPoint': false,
            },
        })
    ).documents;

    while (documents.length > 0) {
        for (const rawData of documents) {
            try {
                const { districtId, wardId } = await getDistrictIdAndWardId(
                    rawData
                );
                await handleVisualizationMapPoint(districtId, wardId, rawData);
                rawData.status.isMapPoint = true;
                await rawData.save();

                new ConsoleLog(
                    ConsoleConstant.Type.INFO,
                    `Preprocessing data - Map point - RID: ${rawData._id}`
                ).show();
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Preprocessing data - Map point - RID: ${rawData._id} - Error: ${error.message}`
                ).show();
            }
        }
        documents = (
            await rawDataLogic.getAll({
                limit: DOCUMENT_LIMIT,
                conditions: {
                    'status.isMapPoint': false,
                },
            })
        ).documents;
    }
    script.next();
};

import { RawDataDocumentModel } from '@service/raw-data/interface';
import {
    MapPoint,
    VisualMapPointDocumentModel,
} from '@service/visual/map-point/interface';
import CommonConstant from '@common/constant';
import VisualMapPointLogic from '@service/visual/map-point/VisualMapPointLogic';

/**
 * Add visualization data for map point
 *
 * @param {number} districtId
 * @param {number} wardId
 * @param {number} lat
 * @param {number} lng
 * @param {RawDataDocumentModel} rawData
 */
export const handleVisualizationMapPoint = async (
    districtId: number,
    wardId: number,
    lat: number,
    lng: number,
    { _id, acreage, price, transactionType, propertyType }: RawDataDocumentModel
): Promise<void> => {
    const visualMapPointLogic = VisualMapPointLogic.getInstance();
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

    const point = visualMapPointDocument.points.filter(
        ({
            transactionType: pointTransactionType,
            propertyType: pointPropertyType,
        }) =>
            transactionType === pointTransactionType &&
            propertyType === pointPropertyType
    )[0];
    if (!point) {
        visualMapPointDocument.points.push({
            rawDataset: [newPoint],
            transactionType,
            propertyType,
        });
    } else {
        point.rawDataset.push(newPoint);
    }

    await visualMapPointLogic.update(
        visualMapPointDocument._id,
        visualMapPointDocument
    );
};

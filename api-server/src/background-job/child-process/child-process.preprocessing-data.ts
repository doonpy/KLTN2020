import 'module-alias/register';
import '@root/prepend';
import ConsoleLog from '@util/console/console.log';
import ConsoleConstant from '@util/console/console.constant';
import ChatBotTelegram from '@util/chatbot/chatBotTelegram';
import RawDataLogic from '@service/raw-data/raw-data.logic';
import CoordinateLogic from '@service/coordinate/coordinate.logic';
import { RawDataDocumentModel } from '@service/raw-data/raw-data.interface';
import { CoordinateDocumentModel } from '@service/coordinate/coordinate.interface';
import DateTime from '@util/datetime/datetime';
import VisualizationDistrictModel from '@service/visualization/administrative/district/visualization.district.model';
import { VisualizationDistrictDocumentModel } from '@service/visualization/administrative/district/visualization.district.interface';
import VisualizationWardModel from '@service/visualization/administrative/ward/visualization.ward.model';
import { VisualizationWardDocumentModel } from '@service/visualization/administrative/ward/visualization.ward.interface';
import { getGeocode } from '@util/external-api/external-api.map';
import { VisualizationMapPointDocumentModel } from '@service/visualization/map-point/visualization.map-point.interface';
import VisualizationMapPointModel from '@service/visualization/map-point/visualization.map-point.model';
import VisualizationSummaryDistrictWardModel from '@service/visualization/summary/district-ward/visualization.summary.district-ward.model';
import VisualizationSummaryDistrictModel from '@service/visualization/summary/district/visualization.summary.district.model';
import { VisualizationSummaryDistrictWardDocumentModel } from '@service/visualization/summary/district-ward/visualization.summary.district-ward.interface';
import { BingMapGeocodeResponse } from '@util/external-api/external-api.map.interface';
import { VisualizationSummaryDistrictDocumentModel } from '@service/visualization/summary/district/visualization.summary.district.interface';
import StringHandler from '@util/helper/string-handler';
import CommonConstant from '@common/common.constant';

const coordinateLogic: CoordinateLogic = CoordinateLogic.getInstance();
const rawDataLogic: RawDataLogic = RawDataLogic.getInstance();
const PROCESSES_LIMIT = 20;
const DOCUMENTS_LIMIT = 1000;
let rawDataset: {
    documents: RawDataDocumentModel[];
    hasNext: boolean;
};
let processCount = 0;
let districtPattern = '';
let wardPattern = '';

type AddressProperties = {
    city?: string;
    district?: string;
    ward?: string;
    street?: string;
    houseNumber?: string;
};

type SummaryElement = {
    transactionType: number;
    propertyType: number;
    amount: number;
};

/**
 * Separate address to certain property
 *
 * @param {string} address
 *
 * @return {AddressProperties}
 */
const getAddressProperties = (address: string): AddressProperties => {
    const ward: string = StringHandler.removeSpecialCharacterAtHeadAndTail(
        address.match(RegExp(wardPattern))?.shift() || ''
    );
    address = address.replace(ward, '');

    const district: string = StringHandler.removeSpecialCharacterAtHeadAndTail(
        address.match(RegExp(districtPattern))?.shift() || ''
    );

    return {
        district,
        ward,
    };
};

/**
 * Get coordinate of certain address
 *
 * @param {string} address
 *
 * @return {Promise<CoordinateDocumentModel | undefined>}
 */
const getCoordinate = async (address: string): Promise<CoordinateDocumentModel | undefined> => {
    const [addressFiltered] = address.match(/(đường|phố).*/i) || [''];
    if (!addressFiltered) {
        return undefined;
    }

    let coordinateDoc: CoordinateDocumentModel = await coordinateLogic.getByLocation(address);
    if (!coordinateDoc) {
        const apiResponse: BingMapGeocodeResponse | undefined = await getGeocode(address);

        if (!apiResponse) {
            return undefined;
        }

        if (!apiResponse.resourceSets || apiResponse.resourceSets.length === 0) {
            return undefined;
        }

        if (!apiResponse.resourceSets[0] || apiResponse.resourceSets[0].resources.length === 0) {
            return undefined;
        }

        const [lat, lng]: [number, number] = apiResponse.resourceSets[0].resources[0].point.coordinates;

        coordinateDoc = await coordinateLogic.create({
            location: address,
            lat,
            lng,
        } as CoordinateDocumentModel);
    }

    return coordinateDoc;
};

/**
 * @param {number} summaryDocument
 * @param {number} transactionType
 * @param {number} propertyType
 */
const updateAmount = (
    summaryDocument: VisualizationSummaryDistrictWardDocumentModel | VisualizationSummaryDistrictDocumentModel,
    transactionType: number,
    propertyType: number
): void => {
    const summaryElement: SummaryElement | undefined = summaryDocument.summary.find(
        (item: SummaryElement): boolean =>
            item.transactionType === transactionType && item.propertyType === propertyType
    );
    if (!summaryElement) {
        summaryDocument.summary.push({
            transactionType,
            propertyType,
            amount: 1,
        });
    } else {
        summaryElement.amount += 1;
    }
    summaryDocument.summaryAmount += 1;
};

/**
 * Add summary data for visualization summary by district
 *
 * @param {number} districtId
 * @param {number} transactionType
 * @param {number} propertyType
 */
const handleVisualizationSummaryDistrictData = async (
    districtId: number,
    transactionType: number,
    propertyType: number
): Promise<void> => {
    const visualizationSummaryDistrictDocument: VisualizationSummaryDistrictDocumentModel | null = await VisualizationSummaryDistrictModel.findOne(
        { districtId }
    );

    if (!visualizationSummaryDistrictDocument) {
        await VisualizationSummaryDistrictModel.create({
            districtId,
            summaryAmount: 1,
            summary: [{ transactionType, propertyType, amount: 1 }],
        });
        return;
    }

    updateAmount(visualizationSummaryDistrictDocument, transactionType, propertyType);
    await VisualizationSummaryDistrictModel.findByIdAndUpdate(
        visualizationSummaryDistrictDocument._id,
        visualizationSummaryDistrictDocument
    );
};

/**
 *  Add summary data for visualization summary by district and ward
 *
 * @param {number} districtId
 * @param {number} wardId
 * @param {number} transactionType
 * @param {number} propertyType
 */
const handleVisualizationSummaryDistrictWardData = async (
    districtId: number,
    wardId: number,
    transactionType: number,
    propertyType: number
): Promise<void> => {
    const visualizationSummaryDistrictWardDocument: VisualizationSummaryDistrictWardDocumentModel | null = await VisualizationSummaryDistrictWardModel.findOne(
        { districtId, wardId }
    );

    if (!visualizationSummaryDistrictWardDocument) {
        await VisualizationSummaryDistrictWardModel.create({
            districtId,
            wardId,
            summaryAmount: 1,
            summary: [{ transactionType, propertyType, amount: 1 }],
        });
        return;
    }

    updateAmount(visualizationSummaryDistrictWardDocument, transactionType, propertyType);
    await VisualizationSummaryDistrictWardModel.findByIdAndUpdate(
        visualizationSummaryDistrictWardDocument._id,
        visualizationSummaryDistrictWardDocument
    );
};

/**
 * Add visualization data for map point
 *
 * @param {number} districtId
 * @param {number} wardId
 * @param {number} lat
 * @param {number} lng
 * @param {RawDataDocumentModel} rawData
 */
const handleVisualizationMapPoint = async (
    districtId: number,
    wardId: number,
    lat: number,
    lng: number,
    { _id, acreage, price, transactionType, propertyType }: RawDataDocumentModel
): Promise<void> => {
    const visualizationMapPointDocument: VisualizationMapPointDocumentModel | null = await VisualizationMapPointModel.findOne(
        { lat, lng }
    );

    const newPoint: { rawDataId: number; acreage: number; price: number; currency: string; timeUnit?: string[] } = {
        rawDataId: _id,
        acreage: acreage.value,
        price: price.value,
        currency: price.currency,
    };
    if (transactionType === CommonConstant.TRANSACTION_TYPE[1].id) {
        newPoint.timeUnit = CommonConstant.PRICE_TIME_UNIT[price.timeUnit].wording;
    }

    if (!visualizationMapPointDocument) {
        await VisualizationMapPointModel.create({
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
        });
        return;
    }

    const point:
        | {
              rawDataset: {
                  rawDataId: number;
                  acreage: number;
                  price: number;
                  currency: string;
                  timeUnit?: string[];
              }[];
              transactionType: number;
              propertyType: number;
          }
        | undefined = visualizationMapPointDocument.points.find(
        ({ transactionType: pointTransactionType, propertyType: pointPropertyType }) =>
            transactionType === pointTransactionType && propertyType === pointPropertyType
    );
    if (!point) {
        visualizationMapPointDocument.points.push({
            rawDataset: [newPoint],
            transactionType,
            propertyType,
        });
    } else {
        point.rawDataset.push(newPoint);
    }

    await VisualizationMapPointModel.findByIdAndUpdate(
        visualizationMapPointDocument._id,
        visualizationMapPointDocument
    );
};

process.on(
    'message',
    async (): Promise<void> => {
        const startTime: [number, number] = process.hrtime();
        const telegramChatBotInstance: ChatBotTelegram = ChatBotTelegram.getInstance();
        try {
            await telegramChatBotInstance.sendMessage(`<b>🤖[Add coordinate]🤖</b>\n📝 Start add coordinate...`);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Preprocessing data - Start`).show();

            const districtList: VisualizationDistrictDocumentModel[] = await VisualizationDistrictModel.find();
            const wardList: VisualizationWardDocumentModel[] = await VisualizationWardModel.find();
            districtPattern = districtList.map(({ name }): string => name).join(',|');
            wardPattern = wardList.map(({ name }): string => name).join(',|');
            rawDataset = await rawDataLogic.getAll(DOCUMENTS_LIMIT, undefined, {
                coordinateId: null,
            });
            const loop: NodeJS.Timeout = setInterval(async (): Promise<void> => {
                if (!rawDataset.hasNext && rawDataset.documents.length === 0) {
                    clearInterval(loop);
                    const executeTime: string = DateTime.convertTotalSecondsToTime(process.hrtime(startTime)[0]);
                    await telegramChatBotInstance.sendMessage(
                        `<b>🤖[Add coordinate]🤖</b>\n✅ Add coordinate complete. Execute time: ${executeTime}`
                    );
                    new ConsoleLog(
                        ConsoleConstant.Type.INFO,
                        `Preprocessing data - Execute time: ${executeTime} - Complete`
                    ).show();
                    process.exit(0);
                }

                if (processCount >= PROCESSES_LIMIT) {
                    return;
                }

                const rawData: RawDataDocumentModel | undefined = rawDataset.documents.shift();
                if (!rawData) {
                    return;
                }

                try {
                    if (rawDataset.documents.length === 0) {
                        rawDataset = await rawDataLogic.getAll(DOCUMENTS_LIMIT, undefined, { coordinateId: null });
                    }

                    processCount += 1;
                    new ConsoleLog(ConsoleConstant.Type.INFO, `Preprocessing data -> RID: ${rawData._id}`).show();
                    const addressProperties: AddressProperties = getAddressProperties(rawData.address);
                    const districtId: number | undefined = districtList.find((item) =>
                        new RegExp(`${item.name}$`, 'i').test(addressProperties?.district || '')
                    )?._id;
                    if (!districtId) {
                        new ConsoleLog(
                            ConsoleConstant.Type.ERROR,
                            `Preprocessing data - RID: ${rawData._id} - District ID is invalid - ${rawData.address}`
                        ).show();
                        await rawDataLogic.delete(rawData._id);
                        processCount -= 1;
                        return;
                    }

                    const wardId: number | undefined = wardList.find(
                        (item) =>
                            item.districtId === districtId &&
                            new RegExp(`${item.name}$`).test(addressProperties?.ward || '')
                    )?._id;
                    if (!wardId) {
                        new ConsoleLog(
                            ConsoleConstant.Type.ERROR,
                            `Preprocessing data - RID: ${rawData._id} - Ward ID is invalid - ${rawData.address}`
                        ).show();
                        await rawDataLogic.delete(rawData._id);
                        processCount -= 1;
                        return;
                    }

                    const coordinate: CoordinateDocumentModel | undefined = await getCoordinate(rawData.address);
                    if (!coordinate) {
                        new ConsoleLog(
                            ConsoleConstant.Type.ERROR,
                            `Preprocessing data - RID: ${rawData._id} - Can't get coordinate of this address - ${rawData.address}`
                        ).show();
                        await rawDataLogic.delete(rawData._id);
                        processCount -= 1;
                        return;
                    }

                    rawData.coordinateId = coordinate._id;
                    await rawData.save();

                    await handleVisualizationSummaryDistrictData(
                        districtId,
                        rawData.transactionType,
                        rawData.propertyType
                    );
                    await handleVisualizationSummaryDistrictWardData(
                        districtId,
                        wardId,
                        rawData.transactionType,
                        rawData.propertyType
                    );
                    await handleVisualizationMapPoint(districtId, wardId, coordinate.lat, coordinate.lng, rawData);
                } catch (error) {
                    new ConsoleLog(
                        ConsoleConstant.Type.ERROR,
                        `Preprocessing data - RID: ${rawData._id} - Error: ${error.message}`
                    ).show();
                }
                processCount -= 1;
            }, 10);
        } catch (error) {
            await telegramChatBotInstance.sendMessage(
                `<b>🤖[Add coordinate]🤖</b>\n❌ Add coordinate failed.\nError: ${error.message}`
            );
            new ConsoleLog(
                ConsoleConstant.Type.ERROR,
                `Add coordinate failed - Error: ${error.cause || error.message}`
            ).show();

            process.exit(1);
        }
    }
);

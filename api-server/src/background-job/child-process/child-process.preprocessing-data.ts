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
import VisualizationDistrictModel from '@service/visual/administrative/district/visual.district.model';
import { VisualDistrictDocumentModel } from '@service/visual/administrative/district/visual.district.interface';
import VisualizationWardModel from '@service/visual/administrative/ward/visual.ward.model';
import { VisualWardDocumentModel } from '@service/visual/administrative/ward/visual.ward.interface';
import { getGeocode } from '@util/external-api/external-api.map';
import { MapPoint, VisualMapPointDocumentModel } from '@service/visual/map-point/visual.map-point.interface';
import VisualizationMapPointModel from '@service/visual/map-point/visual.map-point.model';
import VisualizationSummaryDistrictWardModel from '@service/visual/summary/district-ward/visual.summary.district-ward.model';
import VisualizationSummaryDistrictModel from '@service/visual/summary/district/visual.summary.district.model';
import { VisualSummaryDistrictWardDocumentModel } from '@service/visual/summary/district-ward/visual.summary.district-ward.interface';
import { BingMapGeocodeResponse } from '@util/external-api/external-api.map.interface';
import { VisualSummaryDistrictDocumentModel } from '@service/visual/summary/district/visual.summary.district.interface';
import StringHandler from '@util/helper/string-handler';
import CommonConstant from '@common/common.constant';
import VisualAnalysisModel from '@service/visual/analysis/visual.analysis.model';
import {
    AcreageAnalysisData,
    AnalysisData,
    PriceAnalysisData,
    VisualAnalysisDocumentModel,
} from '@service/visual/analysis/visual.analysis.interface';

const telegramChatBotInstance: ChatBotTelegram = ChatBotTelegram.getInstance();
const coordinateLogic: CoordinateLogic = CoordinateLogic.getInstance();
const rawDataLogic: RawDataLogic = RawDataLogic.getInstance();
const DOCUMENTS_LIMIT = 1000;
let script: AsyncGenerator;
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
    summaryDocument: VisualSummaryDistrictWardDocumentModel | VisualSummaryDistrictDocumentModel,
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
    const visualSummaryDistrictDocument: VisualSummaryDistrictDocumentModel | null = await VisualizationSummaryDistrictModel.findOne(
        { districtId }
    );

    if (!visualSummaryDistrictDocument) {
        await VisualizationSummaryDistrictModel.create({
            districtId,
            summaryAmount: 1,
            summary: [{ transactionType, propertyType, amount: 1 }],
        });
        return;
    }

    updateAmount(visualSummaryDistrictDocument, transactionType, propertyType);
    await VisualizationSummaryDistrictModel.findByIdAndUpdate(
        visualSummaryDistrictDocument._id,
        visualSummaryDistrictDocument
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
    const visualSummaryDistrictWardDocument: VisualSummaryDistrictWardDocumentModel | null = await VisualizationSummaryDistrictWardModel.findOne(
        { districtId, wardId }
    );

    if (!visualSummaryDistrictWardDocument) {
        await VisualizationSummaryDistrictWardModel.create({
            districtId,
            wardId,
            summaryAmount: 1,
            summary: [{ transactionType, propertyType, amount: 1 }],
        });
        return;
    }

    updateAmount(visualSummaryDistrictWardDocument, transactionType, propertyType);
    await VisualizationSummaryDistrictWardModel.findByIdAndUpdate(
        visualSummaryDistrictWardDocument._id,
        visualSummaryDistrictWardDocument
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
    const visualMapPointDocument: VisualMapPointDocumentModel | null = await VisualizationMapPointModel.findOne({
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
        newPoint.timeUnit = CommonConstant.PRICE_TIME_UNIT[price.timeUnit].wording;
    }

    if (!visualMapPointDocument) {
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
              rawDataset: MapPoint[];
              transactionType: number;
              propertyType: number;
          }
        | undefined = visualMapPointDocument.points.filter(
        ({ transactionType: pointTransactionType, propertyType: pointPropertyType }) =>
            transactionType === pointTransactionType && propertyType === pointPropertyType
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

    await VisualizationMapPointModel.findByIdAndUpdate(visualMapPointDocument._id, visualMapPointDocument);
};

/**
 * Update analysis data element
 *
 * @param srcData
 * @param desData
 */
const updateAnalysisData = <T extends AnalysisData>(
    srcData: T,
    { summary: desSummary, max: desMax, min: desMin }: T
): T => {
    srcData.summary = Math.round((srcData.summary + desSummary) * 100) / 100;
    srcData.amount += 1;
    srcData.average = Math.round((srcData.summary / srcData.amount) * 100) / 100;
    srcData.max = desMax > srcData.max ? desMax : srcData.max;
    srcData.min = desMin < srcData.min ? desMin : srcData.min;

    return srcData;
};

/**
 * Handle visualization analysis data
 *
 * @param {string} referenceDate
 * @param {RawDataDocumentModel} input
 */
const handleVisualizationAnalysis = async (
    referenceDate: string,
    { transactionType, propertyType, price, acreage }: RawDataDocumentModel
): Promise<void> => {
    const newPriceAnalysisData: PriceAnalysisData = {
        transactionType,
        propertyType,
        summary: price.value,
        amount: 1,
        average: price.value,
        max: price.value,
        min: price.value,
    };
    if (transactionType === CommonConstant.TRANSACTION_TYPE[1].id) {
        newPriceAnalysisData.timeUnit = CommonConstant.PRICE_TIME_UNIT[price.timeUnit].wording;
    }

    const newAcreageAnalysisData: AcreageAnalysisData = {
        transactionType,
        propertyType,
        summary: acreage.value,
        amount: 1,
        average: acreage.value,
        max: acreage.value,
        min: acreage.value,
        measureUnit: acreage.measureUnit,
    };

    const visualAnalysisDocument: VisualAnalysisDocumentModel | null = await VisualAnalysisModel.findOne({
        referenceDate,
    });
    if (!visualAnalysisDocument) {
        await VisualAnalysisModel.create({
            referenceDate: new Date(referenceDate),
            priceAnalysisData: [newPriceAnalysisData],
            acreageAnalysisData: [newAcreageAnalysisData],
        });

        return;
    }

    let priceAnalysisData: PriceAnalysisData | undefined = visualAnalysisDocument.priceAnalysisData.filter(
        ({ transactionType: itemTransactionType, propertyType: itemPropertyType }) =>
            itemTransactionType === transactionType && itemPropertyType === propertyType
    )[0];
    if (!priceAnalysisData) {
        visualAnalysisDocument.priceAnalysisData.push(newPriceAnalysisData);
    } else {
        priceAnalysisData = updateAnalysisData(priceAnalysisData, newPriceAnalysisData);
    }

    let acreageAnalysisData: AcreageAnalysisData | undefined = visualAnalysisDocument.acreageAnalysisData.filter(
        ({ transactionType: itemTransactionType, propertyType: itemPropertyType }) =>
            itemTransactionType === transactionType && itemPropertyType === propertyType
    )[0];
    if (!acreageAnalysisData) {
        visualAnalysisDocument.acreageAnalysisData.push(newAcreageAnalysisData);
    } else {
        acreageAnalysisData = updateAnalysisData(acreageAnalysisData, newAcreageAnalysisData);
    }

    await VisualAnalysisModel.findByIdAndUpdate(visualAnalysisDocument._id, visualAnalysisDocument);
};

/**
 * Add coordinate and summary visualization data step
 */
const addCoordinateAndSummaryVisualizationData = async (): Promise<void> => {
    const districtList: VisualDistrictDocumentModel[] = await VisualizationDistrictModel.find();
    const wardList: VisualWardDocumentModel[] = await VisualizationWardModel.find();
    districtPattern = districtList.map(({ name }): string => name).join(',|');
    wardPattern = wardList.map(({ name }): string => name).join(',|');
    rawDataset = await rawDataLogic.getAll(DOCUMENTS_LIMIT, undefined, {
        coordinateId: null,
    });

    while (rawDataset.hasNext && rawDataset.documents.length !== 0) {
        for (const rawData of rawDataset.documents) {
            try {
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

                await handleVisualizationSummaryDistrictData(districtId, rawData.transactionType, rawData.propertyType);
                await handleVisualizationSummaryDistrictWardData(
                    districtId,
                    wardId,
                    rawData.transactionType,
                    rawData.propertyType
                );
                await handleVisualizationMapPoint(districtId, wardId, coordinate.lat, coordinate.lng, rawData);
                await handleVisualizationAnalysis(rawData.postDate, rawData);
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Preprocessing data - RID: ${rawData._id} - Error: ${error.message}`
                ).show();
            }
        }

        rawDataset = await rawDataLogic.getAll(DOCUMENTS_LIMIT, undefined, { coordinateId: null });
    }

    script.next();
};

/**
 * Script of preprocessing data
 */
async function* generateScript() {
    const startTime: [number, number] = process.hrtime();
    await telegramChatBotInstance.sendMessage(`<b>🤖[Preprocessing data]🤖</b>\n📝 Start preprocessing data...`);
    new ConsoleLog(ConsoleConstant.Type.INFO, `Preprocessing data - Start`).show();

    await addCoordinateAndSummaryVisualizationData();
    yield 'Step 1: Add coordinate, summary and analysis visualization data';

    const executeTime: string = DateTime.convertTotalSecondsToTime(process.hrtime(startTime)[0]);
    await telegramChatBotInstance.sendMessage(
        `<b>🤖[Preprocessing data]🤖</b>\n✅ Preprocessing data complete. Execute time: ${executeTime}`
    );
    new ConsoleLog(ConsoleConstant.Type.INFO, `Preprocessing data - Execute time: ${executeTime} - Complete`).show();
    process.exit(0);
    return 'Done';
}

/**
 * Main process
 */
process.on(
    'message',
    async (): Promise<void> => {
        try {
            script = generateScript();
            script.next();
        } catch (error) {
            await telegramChatBotInstance.sendMessage(
                `<b>🤖[Preprocessing data]🤖</b>\n❌ Preprocessing data failed.\nError: ${error.message}`
            );
            new ConsoleLog(
                ConsoleConstant.Type.ERROR,
                `Preprocessing data - Error: ${error.cause || error.message}`
            ).show();

            process.exit(1);
        }
    }
);

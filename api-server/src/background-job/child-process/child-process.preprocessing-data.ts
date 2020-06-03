import 'module-alias/register';
import '@root/prepend';
import ConsoleLog from '@util/console/console.log';
import ConsoleConstant from '@util/console/console.constant';
import ChatBotTelegram from '@util/chatbot/chatBotTelegram';
import RawDataLogic from '@service/raw-data/raw-data.logic';
import CoordinateLogic from '@service/coordinate/coordinate.logic';
import { RawDataDocumentModel } from '@service/raw-data/raw-data.interface';
import { CoordinateDocumentModel } from '@service/coordinate/coordinate.interface';
import { getGeocode } from '@util/external-api/external-api.map';
import {
    MapPoint,
    VisualMapPointDocumentModel,
} from '@service/visual/map-point/visual.map-point.interface';
import { VisualSummaryDistrictWardDocumentModel } from '@service/visual/summary/district-ward/visual.summary.district-ward.interface';
import { VisualSummaryDistrictDocumentModel } from '@service/visual/summary/district/visual.summary.district.interface';
import { removeSpecialCharacterAtHeadAndTail } from '@util/helper/string';
import CommonConstant from '@common/common.constant';
import {
    AcreageAnalysisData,
    AnalysisData,
    PriceAnalysisData,
    VisualAnalysisDocumentModel,
} from '@service/visual/analysis/visual.analysis.interface';
import VisualSummaryDistrictLogic from '@service/visual/summary/district/visual.summary.district.logic';
import VisualSummaryDistrictWardLogic from '@service/visual/summary/district-ward/visual.summary.district-ward.logic';
import VisualMapPointLogic from '@service/visual/map-point/visual.map-point.logic';
import VisualAnalysisLogic from '@service/visual/analysis/visual.analysis.logic';
import VisualAdministrativeDistrictLogic from '@service/visual/administrative/district/visual.administrative.district.logic';
import VisualAdministrativeWardLogic from '@service/visual/administrative/ward/visual.administrative.ward.logic';
import { convertTotalSecondsToTime } from '@util/helper/datetime';
import { VisualAdministrativeDistrictDocumentModel } from '@service/visual/administrative/district/visual.administrative.district.interface';

const telegramChatBotInstance = ChatBotTelegram.getInstance();
const coordinateLogic = CoordinateLogic.getInstance();
const rawDataLogic = RawDataLogic.getInstance();
const visualSummaryDistrictLogic = VisualSummaryDistrictLogic.getInstance();
const visualSummaryDistrictWardLogic = VisualSummaryDistrictWardLogic.getInstance();
const visualMapPointLogic = VisualMapPointLogic.getInstance();
const visualAnalysisLogic = VisualAnalysisLogic.getInstance();
const visualAdministrativeDistrictLogic = VisualAdministrativeDistrictLogic.getInstance();
const visualAdministrativeWardLogic = VisualAdministrativeWardLogic.getInstance();
const DOCUMENTS_LIMIT = 1000;
let script: AsyncGenerator;
let rawDataset: {
    documents: RawDataDocumentModel[];
    hasNext: boolean;
};
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
    const ward = removeSpecialCharacterAtHeadAndTail(
        address.match(RegExp(wardPattern))?.shift() || ''
    );
    address = address.replace(ward, '');

    const district = removeSpecialCharacterAtHeadAndTail(
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
const getCoordinate = async (
    address: string
): Promise<CoordinateDocumentModel | undefined> => {
    const [addressFiltered] = address.match(/(đường|phố).*/i) || [''];
    if (!addressFiltered) {
        return undefined;
    }

    let coordinateDoc = await coordinateLogic.getByLocation(address);
    if (!coordinateDoc) {
        const apiResponse = await getGeocode(address);

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
    summaryDocument:
        | VisualSummaryDistrictWardDocumentModel
        | VisualSummaryDistrictDocumentModel,
    transactionType: number,
    propertyType: number
): void => {
    const summaryElement = summaryDocument.summary.find(
        (item: SummaryElement) =>
            item.transactionType === transactionType &&
            item.propertyType === propertyType
    );
    if (!summaryElement) {
        summaryDocument.summary.push({
            transactionType,
            propertyType,
            amount: 1,
        });
    } else {
        summaryElement.amount++;
    }
    summaryDocument.summaryAmount++;
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
    const visualSummaryDistrictDocument = await visualSummaryDistrictLogic.getById(
        districtId
    );

    if (!visualSummaryDistrictDocument) {
        await visualSummaryDistrictLogic.create({
            districtId,
            summaryAmount: 1,
            summary: [{ transactionType, propertyType, amount: 1 }],
        } as VisualSummaryDistrictDocumentModel);
        return;
    }

    updateAmount(visualSummaryDistrictDocument, transactionType, propertyType);
    await visualSummaryDistrictLogic.update(
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
    const visualSummaryDistrictWardDocument = await visualSummaryDistrictWardLogic.getOne(
        {
            conditions: {
                districtId,
                wardId,
            },
        }
    );

    if (!visualSummaryDistrictWardDocument) {
        await visualSummaryDistrictWardLogic.create({
            districtId,
            wardId,
            summaryAmount: 1,
            summary: [{ transactionType, propertyType, amount: 1 }],
        } as VisualSummaryDistrictWardDocumentModel);
        return;
    }

    updateAmount(
        visualSummaryDistrictWardDocument,
        transactionType,
        propertyType
    );
    await visualSummaryDistrictWardLogic.update(
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
    const visualMapPointDocument = await visualMapPointLogic.getOne({
        conditions: {
            lat,
            lng,
        },
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
    srcData.amount++;
    srcData.average =
        Math.round((srcData.summary / srcData.amount) * 100) / 100;
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
        newPriceAnalysisData.timeUnit =
            CommonConstant.PRICE_TIME_UNIT[price.timeUnit].wording;
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

    const visualAnalysisDocument = await visualAnalysisLogic.getOne({
        conditions: {
            referenceDate,
        },
    });
    if (!visualAnalysisDocument) {
        await visualAnalysisLogic.create(({
            referenceDate: new Date(referenceDate),
            priceAnalysisData: [newPriceAnalysisData],
            acreageAnalysisData: [newAcreageAnalysisData],
        } as unknown) as VisualAnalysisDocumentModel);

        return;
    }

    let priceAnalysisData = visualAnalysisDocument.priceAnalysisData.filter(
        ({
            transactionType: itemTransactionType,
            propertyType: itemPropertyType,
        }) =>
            itemTransactionType === transactionType &&
            itemPropertyType === propertyType
    )[0];
    if (!priceAnalysisData) {
        visualAnalysisDocument.priceAnalysisData.push(newPriceAnalysisData);
    } else {
        priceAnalysisData = updateAnalysisData(
            priceAnalysisData,
            newPriceAnalysisData
        );
    }

    let acreageAnalysisData = visualAnalysisDocument.acreageAnalysisData.filter(
        ({
            transactionType: itemTransactionType,
            propertyType: itemPropertyType,
        }) =>
            itemTransactionType === transactionType &&
            itemPropertyType === propertyType
    )[0];
    if (!acreageAnalysisData) {
        visualAnalysisDocument.acreageAnalysisData.push(newAcreageAnalysisData);
    } else {
        acreageAnalysisData = updateAnalysisData(
            acreageAnalysisData,
            newAcreageAnalysisData
        );
    }

    await visualAnalysisLogic.update(
        visualAnalysisDocument._id,
        visualAnalysisDocument
    );
};

/**
 * Add coordinate and summary visualization data step
 */
const addCoordinateAndSummaryVisualizationData = async (): Promise<void> => {
    const districtList = (await visualAdministrativeDistrictLogic.getAll({}))
        .documents;
    const districtNames = districtList.map(({ name }) => name);
    districtPattern = districtNames
        .filter((name, index) => index === districtNames.lastIndexOf(name))
        .join(',|');

    const wardList = (await visualAdministrativeWardLogic.getAll({})).documents;
    const wardNames = wardList.map(({ name }) => name);
    wardPattern = wardNames
        .filter((name, index) => index === wardNames.lastIndexOf(name))
        .join(',|');

    rawDataset = await rawDataLogic.getAll({
        limit: DOCUMENTS_LIMIT,
        conditions: {
            coordinateId: null,
        },
    });

    while (rawDataset.hasNext && rawDataset.documents.length !== 0) {
        for (const rawData of rawDataset.documents) {
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Preprocessing data -> RID: ${rawData._id}`
            ).show();
            const addressProperties = getAddressProperties(rawData.address);

            const districtId:
                | number
                | undefined = districtList.filter(({ name: districtName }) =>
                RegExp(`${districtName}$`, 'i').test(
                    addressProperties?.district || ''
                )
            )[0]?._id;
            if (!districtId) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Preprocessing data - RID: ${rawData._id} - District ID is invalid - ${rawData.address}`
                ).show();
                await rawDataLogic.delete(rawData._id);
                continue;
            }

            const wardId: number | undefined = wardList.filter(
                ({ name: wardName, districtId: wardDistrictId }) =>
                    (wardDistrictId as VisualAdministrativeDistrictDocumentModel)
                        ._id === districtId &&
                    RegExp(`${wardName}$`, 'i').test(
                        addressProperties?.ward || ''
                    )
            )[0]?._id;
            if (!wardId) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Preprocessing data - RID: ${rawData._id} - Ward ID is invalid - ${rawData.address}`
                ).show();
                await rawDataLogic.delete(rawData._id);
                continue;
            }

            const coordinate = await getCoordinate(rawData.address);
            if (!coordinate) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Preprocessing data - RID: ${rawData._id} - Can't get coordinate of this address - ${rawData.address}`
                ).show();
                await rawDataLogic.delete(rawData._id);
                continue;
            }

            rawData.coordinateId = coordinate._id;

            try {
                await Promise.all([
                    rawData.save(),
                    handleVisualizationSummaryDistrictData(
                        districtId,
                        rawData.transactionType,
                        rawData.propertyType
                    ),
                    handleVisualizationSummaryDistrictWardData(
                        districtId,
                        wardId,
                        rawData.transactionType,
                        rawData.propertyType
                    ),
                    handleVisualizationMapPoint(
                        districtId,
                        wardId,
                        coordinate.lat,
                        coordinate.lng,
                        rawData
                    ),
                    handleVisualizationAnalysis(rawData.postDate, rawData),
                ]);
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Preprocessing data - RID: ${rawData._id} - Error: ${rawData.address}`
                ).show();
            }
        }

        rawDataset = await rawDataLogic.getAll({
            limit: DOCUMENTS_LIMIT,
            conditions: {
                coordinateId: null,
            },
        });
    }

    script.next();
};

/**
 * Script of preprocessing data
 */
async function* generateScript() {
    const startTime = process.hrtime();
    await telegramChatBotInstance.sendMessage(
        `<b>🤖[Preprocessing data]🤖</b>\n📝 Start preprocessing data...`
    );
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Preprocessing data - Start`
    ).show();

    await addCoordinateAndSummaryVisualizationData();
    yield 'Step 1: Add coordinate, summary and analysis visualization data';

    const executeTime = convertTotalSecondsToTime(process.hrtime(startTime)[0]);
    await telegramChatBotInstance.sendMessage(
        `<b>🤖[Preprocessing data]🤖</b>\n✅ Preprocessing data complete. Execute time: ${executeTime}`
    );
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Preprocessing data - Execute time: ${executeTime} - Complete`
    ).show();
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

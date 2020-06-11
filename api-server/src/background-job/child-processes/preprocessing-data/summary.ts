import VisualSummaryDistrictLogic from '@service/visual/summary/district/VisualSummaryDistrictLogic';
import VisualSummaryDistrictWardLogic from '@service/visual/summary/district-ward/VisualSummaryDistrictWardLogic';
import { VisualSummaryDistrictWardDocumentModel } from '@service/visual/summary/district-ward/interface';
import { VisualSummaryDistrictDocumentModel } from '@service/visual/summary/district/interface';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import { DOCUMENT_LIMIT } from '@background-job/child-processes/preprocessing-data/constant';
import RawDataLogic from '@service/raw-data/RawDataLogic';
import { getAddressProperties } from '@background-job/child-processes/preprocessing-data/helper';

const rawDataLogic = RawDataLogic.getInstance();

type SummaryElement = {
    transactionType: number;
    propertyType: number;
    amount: number;
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
const handleVisualSummaryDistrictData = async (
    districtId: number,
    transactionType: number,
    propertyType: number
): Promise<void> => {
    const visualSummaryDistrictLogic = VisualSummaryDistrictLogic.getInstance();
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
export const handleVisualSummaryDistrictWardData = async (
    districtId: number,
    wardId: number,
    transactionType: number,
    propertyType: number
): Promise<void> => {
    const visualSummaryDistrictWardLogic = VisualSummaryDistrictWardLogic.getInstance();
    const visualSummaryDistrictWardDocument = await visualSummaryDistrictWardLogic.getOne(
        { districtId, wardId }
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
 * Summary phase
 */
export const summaryPhase = async (script: AsyncGenerator): Promise<void> => {
    let documents = (
        await rawDataLogic.getAll({
            limit: DOCUMENT_LIMIT,
            conditions: {
                'status.isSummary': false,
            },
        })
    ).documents;

    while (documents.length > 0) {
        for (const rawData of documents) {
            try {
                const addressProperties = await getAddressProperties(
                    rawData.address
                );

                const districtId: number | undefined =
                    addressProperties.district?._id;
                if (!districtId) {
                    new ConsoleLog(
                        ConsoleConstant.Type.ERROR,
                        `Preprocessing data - RID: ${rawData._id} - District ID is invalid - ${rawData.address}`
                    ).show();
                    await rawDataLogic.delete(rawData._id);
                    return;
                }

                const wardId: number | undefined = addressProperties.ward?._id;
                if (!wardId) {
                    new ConsoleLog(
                        ConsoleConstant.Type.ERROR,
                        `Preprocessing data - RID: ${rawData._id} - Ward ID is invalid - ${rawData.address}`
                    ).show();
                    await rawDataLogic.delete(rawData._id);
                    return;
                }
                rawData.status.isSummary = true;
                await Promise.all([
                    handleVisualSummaryDistrictWardData(
                        districtId,
                        wardId,
                        rawData.transactionType,
                        rawData.propertyType
                    ),
                    handleVisualSummaryDistrictData(
                        districtId,
                        rawData.transactionType,
                        rawData.propertyType
                    ),
                    rawDataLogic.update(rawData._id, rawData),
                ]);
                new ConsoleLog(
                    ConsoleConstant.Type.INFO,
                    `Preprocessing data - Summary - RID: ${rawData._id}`
                ).show();
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Preprocessing data - Summary - RID: ${rawData._id} - Error: ${error.message}`
                ).show();
            }
        }
        documents = (
            await rawDataLogic.getAll({
                limit: DOCUMENT_LIMIT,
                conditions: {
                    'status.isSummary': false,
                },
            })
        ).documents;
    }
    script.next();
};

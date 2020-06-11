import VisualSummaryDistrictLogic from '@service/visual/summary/district/VisualSummaryDistrictLogic';
import VisualSummaryDistrictWardLogic from '@service/visual/summary/district-ward/VisualSummaryDistrictWardLogic';
import { VisualSummaryDistrictWardDocumentModel } from '@service/visual/summary/district-ward/interface';
import { VisualSummaryDistrictDocumentModel } from '@service/visual/summary/district/interface';

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
export const handleVisualSummaryDistrictData = async (
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

import VisualSummaryDistrictLogic from '@service/visual/summary/district/VisualSummaryDistrictLogic';
import VisualSummaryDistrictWardLogic from '@service/visual/summary/district-ward/VisualSummaryDistrictWardLogic';
import { VisualSummaryDistrictWardDocumentModel } from '@service/visual/summary/district-ward/interface';
import { VisualSummaryDistrictDocumentModel } from '@service/visual/summary/district/interface';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import { getAddressProperties } from '@background-job/child-processes/preprocessing-data/helper';
import { RawDataDocumentModel } from '@service/raw-data/interface';
import {
    setStateCache,
    StateCacheProperties,
} from '@background-job/child-processes/preprocessing-data/preprocessing-data';

type SummaryElement = {
    transactionType: number;
    propertyType: number;
    amount: number;
};

const updateAmount = (
    summaryDocument:
        | VisualSummaryDistrictWardDocumentModel
        | VisualSummaryDistrictDocumentModel,
    transactionType: number,
    propertyType: number
): void => {
    const summaryIndex = summaryDocument.summary.findIndex(
        (item: SummaryElement) =>
            item.transactionType === transactionType &&
            item.propertyType === propertyType
    );
    if (summaryIndex === -1) {
        summaryDocument.summary.push({
            transactionType,
            propertyType,
            amount: 1,
        });
    } else {
        summaryDocument.summary[summaryIndex].amount++;
    }
    summaryDocument.summaryAmount++;
};

/**
 * Add summary data for visualization summary by district
 */
const handleVisualSummaryDistrictData = async (
    districtId: number,
    transactionType: number,
    propertyType: number
): Promise<void> => {
    const visualSummaryDistrictLogic = VisualSummaryDistrictLogic.getInstance();
    const targetDocument = await visualSummaryDistrictLogic.getOne({
        districtId,
    });

    if (!targetDocument) {
        const newDocument = await visualSummaryDistrictLogic.create({
            districtId,
            summaryAmount: 1,
            summary: [{ transactionType, propertyType, amount: 1 }],
        } as VisualSummaryDistrictDocumentModel);
        newDocument.isNew = true;
        setStateCache(StateCacheProperties.SUMMARY_DISTRICT, newDocument);
        return;
    }

    setStateCache(StateCacheProperties.SUMMARY_DISTRICT, targetDocument);
    updateAmount(targetDocument, transactionType, propertyType);
    await targetDocument.save();
};

/**
 *  Add summary data for visualization summary by district and ward
 */
export const handleVisualSummaryDistrictWardData = async (
    districtId: number,
    wardId: number,
    transactionType: number,
    propertyType: number
): Promise<void> => {
    const visualSummaryDistrictWardLogic = VisualSummaryDistrictWardLogic.getInstance();
    const targetDocument = await visualSummaryDistrictWardLogic.getOne({
        districtId,
        wardId,
    });

    if (!targetDocument) {
        const newDocument = await visualSummaryDistrictWardLogic.create({
            districtId,
            wardId,
            summaryAmount: 1,
            summary: [{ transactionType, propertyType, amount: 1 }],
        } as VisualSummaryDistrictWardDocumentModel);
        newDocument.isNew = true;
        setStateCache(StateCacheProperties.SUMMARY_DISTRICT_WARD, newDocument);
        return;
    }

    setStateCache(StateCacheProperties.SUMMARY_DISTRICT_WARD, targetDocument);
    updateAmount(targetDocument, transactionType, propertyType);
    await targetDocument.save();
};

/**
 * Summary phase
 */
export const summaryPhase = async (
    rawData: RawDataDocumentModel
): Promise<void> => {
    const addressProperties = await getAddressProperties(rawData.address);

    const districtId: number | undefined = addressProperties.district?._id;
    if (!districtId) {
        throw new Error(
            `Summary - District ID is invalid - ${rawData.address}`
        );
    }

    const wardId: number | undefined = addressProperties.ward?._id;
    if (!wardId) {
        throw new Error(`Summary - Ward ID is invalid - ${rawData.address}`);
    }

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
    ]);
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Preprocessing data - Summary - RID: ${rawData._id}`
    ).show();
};

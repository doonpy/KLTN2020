import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import { VisualSummaryDistrictDocumentModel } from '@service/visual/summary/district/interface';
import { VisualSummaryDistrictWardDocumentModel } from '@service/visual/summary/district-ward/interface';
import VisualSummaryDistrictLogic from '@service/visual/summary/district/VisualSummaryDistrictLogic';
import VisualSummaryDistrictWardLogic from '@service/visual/summary/district-ward/VisualSummaryDistrictWardLogic';
import VisualAdministrativeDistrictLogic from '@service/visual/administrative/district/VisualAdministrativeDistrictLogic';
import VisualAdministrativeWardLogic from '@service/visual/administrative/ward/VisualAdministrativeWardLogic';

/**
 * Initialize visual summary data
 */
export const initVisualSummaryData = async (): Promise<void> => {
    const visualSummaryDistrictLogic = VisualSummaryDistrictLogic.getInstance();
    const visualSummaryDistrictWardLogic = VisualSummaryDistrictWardLogic.getInstance();
    const visualAdministrativeDistrictLogic = VisualAdministrativeDistrictLogic.getInstance();
    const visualAdministrativeWardLogic = VisualAdministrativeWardLogic.getInstance();
    const PROPERTY_TYPE_AMOUNT = 12;
    const TRANSACTION_TYPE_AMOUNT = 2;

    const summaryDefault: Array<{
        transactionType: number;
        propertyType: number;
        amount: number;
    }> = [];
    for (let i = 1; i < TRANSACTION_TYPE_AMOUNT; i++) {
        for (let j = 1; j < PROPERTY_TYPE_AMOUNT; j++) {
            summaryDefault.push({
                transactionType: i,
                propertyType: j,
                amount: 0,
            });
        }
    }

    const districtList = (await visualAdministrativeDistrictLogic.getAll({}))
        .documents;
    for (const district of districtList) {
        if (
            !(await visualSummaryDistrictLogic.isExists({
                districtId: district._id,
            }))
        ) {
            await visualSummaryDistrictLogic.create({
                districtId: district._id,
                summaryAmount: 0,
                summary: summaryDefault,
            } as VisualSummaryDistrictDocumentModel);
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Initialize visual summary data - Summary district - DID: ${district._id}`
            ).show();
        }

        const wardList = (
            await visualAdministrativeWardLogic.getAll({
                conditions: {
                    districtId: district._id,
                },
            })
        ).documents;
        for (const ward of wardList) {
            if (
                !(await visualSummaryDistrictWardLogic.isExists({
                    districtId: district._id,
                    wardId: ward._id,
                }))
            ) {
                await visualSummaryDistrictWardLogic.create({
                    districtId: district._id,
                    wardId: ward._id,
                    summaryAmount: 0,
                    summary: summaryDefault,
                } as VisualSummaryDistrictWardDocumentModel);
                new ConsoleLog(
                    ConsoleConstant.Type.INFO,
                    `Initialize visual summary data - Summary district ward - DID: ${district._id} - WID: ${ward._id}`
                ).show();
            }
        }
    }

    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        'Initialize visual summary data - Done'
    ).show();
};

import VisualAnalyticsLogic from '@service/visual/analytics/VisualAnalyticsLogic';
import CommonConstant from '@common/constant';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';

export const initVisualAnalyticsData = async (): Promise<void> => {
    const visualAnalyticsLogic = VisualAnalyticsLogic.getInstance();
    const YEAR_RANGE = 1;
    const MONTH_RANGE = 12;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const transactionTypeIds = CommonConstant.TRANSACTION_TYPE.map(
        ({ id }) => id
    );
    const defaultData = {
        amount: 0,
        perMeterAverage: 0,
        perMeterMax: 0,
        perMeterMin: 0,
        perMeterSum: 0,
        priceMax: 0,
        priceMin: 0,
    };
    const propertyTypeIds = CommonConstant.PROPERTY_TYPE.map(({ id }) => id);
    for (let year = currentYear - YEAR_RANGE; year <= currentYear; year++) {
        for (let month = 1; month <= MONTH_RANGE; month++) {
            if (year === currentYear && month > currentMonth) {
                continue;
            }

            for (const transactionTypeId of transactionTypeIds) {
                for (const propertyTypeId of propertyTypeIds) {
                    // eslint-disable-next-line max-depth
                    if (
                        await visualAnalyticsLogic.isExists({
                            year,
                            month,
                            transactionType: transactionTypeId,
                            propertyType: propertyTypeId,
                        })
                    ) {
                        continue;
                    }

                    await visualAnalyticsLogic.create({
                        year,
                        month,
                        transactionType: transactionTypeId,
                        propertyType: propertyTypeId,
                        ...defaultData,
                    });
                    new ConsoleLog(
                        ConsoleConstant.Type.INFO,
                        `Initialize visual analytics data - Year: ${year} - Month: ${month} - Transaction type: ${transactionTypeId} - Property type: ${propertyTypeId}`
                    ).show();
                }
            }
        }
    }

    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        'Initialize visual analytics data - Done'
    ).show();
};

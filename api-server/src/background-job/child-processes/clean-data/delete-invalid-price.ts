import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import RawDataLogic from '@service/raw-data/RawDataLogic';
import CommonConstant from '@common/constant';

/**
 * Delete data which have invalid price value
 */
export const deleteInvalidPrice = async (
    script: AsyncGenerator
): Promise<void> => {
    const rawDataLogic = RawDataLogic.getInstance();
    const EXPECTED_SALE_PRICE_VALUE = 1000000;
    const EXPECTED_RENT_PRICE_VALUE = 100000;
    const deleteConditions = {
        $or: [
            {
                'price.value': { $lt: EXPECTED_SALE_PRICE_VALUE },
                transactionType: CommonConstant.TRANSACTION_TYPE[0].id,
            },
            {
                'price.value': { $lt: EXPECTED_RENT_PRICE_VALUE },
                transactionType: CommonConstant.TRANSACTION_TYPE[1].id,
            },
        ],
    };
    const deletedAmount = await rawDataLogic.deleteByConditions(
        deleteConditions
    );

    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Clean data - Delete invalid price - Amount: ${deletedAmount}`
    ).show();
    script.next();
};

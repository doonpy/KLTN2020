import React from 'react';
import groupBy from 'lodash.groupby';
import PropTypes from 'prop-types';
import LineChart from '../charts/LineChart';
import { TRANSATION_SELECT } from '../../util/constants';

const BILLION = 1000000;
const TRANSACTION_ARR = [1, 2];
const TransactionLineChartWrapper = ({ data }) => {
    const dataGroupByTransaction = groupBy(data?.analytics, (c) => {
        return c.transactionType;
    });
    const dataYears = groupBy(data?.analytics, (c) => `${c.month}-${c.year}`);
    const getDataTransaction = () => {
        const dataTransaction = [];
        let dataResult = [];
        for (const key in dataGroupByTransaction) {
            if ({}.hasOwnProperty.call(dataGroupByTransaction, key)) {
                const dataProperty = dataGroupByTransaction[key].map((c) =>
                    Object({
                        time: `${c.month}/${c.year}`,
                        price: c.perMeterAverage / BILLION,
                    })
                );

                const dataTransGroupByTime = groupBy(
                    dataProperty,
                    (c) => c.time
                );

                for (const keyData in dataTransGroupByTime) {
                    if ({}.hasOwnProperty.call(dataTransGroupByTime, keyData)) {
                        const priceAverage =
                            dataTransGroupByTime[keyData].reduce(
                                (total, current) => {
                                    return total + current.price;
                                },
                                0
                            ) / dataTransGroupByTime[keyData].length;

                        dataTransaction.push({
                            key: Number(key),
                            priceAverage: Math.round(priceAverage * 100) / 100,
                        });
                    }
                }
            }
        }

        dataResult = TRANSACTION_ARR.map((c) => {
            return {
                name: TRANSATION_SELECT[c].type,
                data: dataTransaction
                    .filter((d) => d.key === c)
                    .map((d) => d.priceAverage),
            };
        });

        return dataResult;
    };

    return (
        <div className="pt-10 pr-4 dark:bg-gray-900 bg-white border border-solid border-light-primary dark:border-primary h-full w-full">
            <LineChart
                title="Biểu đồ thể hiện sự biến động giá của giao dịch bán và mua qua từng năm"
                catagoriesData={Object.keys(dataYears)}
                data={getDataTransaction()}
            />
        </div>
    );
};
TransactionLineChartWrapper.propTypes = {
    catagoriesYear: PropTypes.arrayOf(PropTypes.string),
    data: PropTypes.any,
};
export default TransactionLineChartWrapper;

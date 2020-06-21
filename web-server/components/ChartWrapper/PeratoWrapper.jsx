import React from 'react';
import PropTypes from 'prop-types';
import ParetoChart from '../charts/ParetoChart';

const PeratoWrapper = ({ dataGroupBy }) => {
    const analyticsData = () => {
        const dataResult = [];
        let obj = {};
        for (const key in dataGroupBy) {
            if ({}.hasOwnProperty.call(dataGroupBy, key)) {
                const sumAmount = dataGroupBy[key].reduce((total, current) => {
                    return total + current.amount;
                }, 0);
                const averagePrice = dataGroupBy[key].reduce(
                    (total, current) => {
                        return total + current.average;
                    },
                    0
                );

                obj = {
                    key,
                    sumAmount: sumAmount,
                    averagePrice: averagePrice / dataGroupBy[key].length,
                };
                dataResult.push(obj);
            }
        }
        return dataResult;
    };
    const categoriesData = analyticsData()?.map((c) => {
        return c.key;
    });
    const ammountData = analyticsData()?.map((c) => {
        return c.sumAmount;
    });
    const priceData = analyticsData()?.map((c) => {
        return Math.round((c.averagePrice / 1000000) * 100) / 100;
    });

    return (
        <div className="w-9/12 pr-4 mt-8 ">
            <div className="dark:bg-gray-900 bg-white border border-solid border-light-primary dark:border-primary">
                <div className="mt-8">
                    <ParetoChart
                        categoriesData={categoriesData}
                        ammountData={ammountData}
                        priceData={priceData}
                    />
                </div>
            </div>
        </div>
    );
};

PeratoWrapper.propTypes = {
    dataGroupBy: PropTypes.objectOf(PropTypes.any),
};
export default PeratoWrapper;

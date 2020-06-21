import React from 'react';
import PropTypes from 'prop-types';
import ParetoChart from '../charts/ParetoChart';
import LoadingIcon from '../LoadingIcon';

const PeratoWrapper = ({ dataGroupBy, loading }) => {
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
                        return total + current.perMeterAverage;
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
    // console.log('[analyticsData ư', analyticsData());
    console.log('data GroupBy ', dataGroupBy);
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
        <div className="w-9/12 pr-4 mt-8" style={{ minHeight: '450px' }}>
            <div className="dark:bg-gray-900 bg-white border border-solid border-light-primary dark:border-primary h-full">
                <div className="mt-8">
                    {!loading ? (
                        <ParetoChart
                            categoriesData={categoriesData}
                            ammountData={ammountData}
                            priceData={priceData}
                        />
                    ) : (
                        <div className="flex justify-center items-center h-full">
                            <LoadingIcon />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

PeratoWrapper.propTypes = {
    dataGroupBy: PropTypes.objectOf(PropTypes.any),
    loading: PropTypes.bool,
};
export default PeratoWrapper;

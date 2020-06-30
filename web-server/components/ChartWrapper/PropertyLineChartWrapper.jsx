import React from 'react';
import groupBy from 'lodash.groupby';
import PropTypes from 'prop-types';
import useAnalytics from '../../hooks/use-analytics';
import LineChart from '../charts/LineChart';
import { getTimeAgo } from '../../util/services/helper';

import { PROPERTY_TYPE_NUMBER } from '../../util/constants';
const BILLION = 1000000;

const PropertyLineChartWrapper = ({ data, catagoriesYear }) => {
    const { data: dataSale, isValidating: loadingRent } = useAnalytics({
        variables: {
            fromMonth: JSON.stringify(getTimeAgo(6).month),
            fromYear: JSON.stringify(getTimeAgo(6).year),
            transactionType: 1,
        },
    });

    const { data: dataRent, isValidating: loadingSale } = useAnalytics({
        variables: {
            fromMonth: JSON.stringify(getTimeAgo(6).month),
            fromYear: JSON.stringify(getTimeAgo(6).year),
            transactionType: 2,
        },
    });

    /**
     *
     * @param {array} arr
     * @return {bool}
     */
    const checkAllZero = (arr) => {
        let countZero = 0;
        arr.forEach((a) => {
            if (a === 0) {
                countZero++;
            }
        });
        if (arr.length === countZero) return true;
        return false;
    };
    const getDataProperty = (dataAnalytics) => {
        const dataGroupByProperty = groupBy(dataAnalytics?.analytics, (c) => {
            return c.propertyType;
        });
        const dataResult = [];

        for (const key in dataGroupByProperty) {
            if ({}.hasOwnProperty.call(dataGroupByProperty, key)) {
                const dataProperty = dataGroupByProperty[key].map((c) => {
                    return (
                        Math.round((c.perMeterAverage / BILLION) * 100) / 100
                    );
                });

                if (!checkAllZero(dataProperty)) {
                    dataResult.push({
                        name: PROPERTY_TYPE_NUMBER[key].wording[0],
                        data: dataProperty,
                    });
                } else continue;
            }
        }
        return dataResult;
    };

    return (
        <div className="flex mt-12">
            <div className="w-1/2 mr-2">
                <div className="pt-10 pr-4 dark:bg-gray-900 bg-white border border-solid border-light-primary dark:border-primary h-full w-full">
                    <LineChart
                        title="Biểu đồ thể hiện sự biến động giá của các loại bất động sản theo giao dịch Bán qua thời gian"
                        catagoriesData={catagoriesYear}
                        data={getDataProperty(dataSale)}
                    />
                </div>
            </div>
            <div className="w-1/2 ml-2">
                <div className="pt-10 pr-4 dark:bg-gray-900 bg-white border border-solid border-light-primary dark:border-primary h-full w-full">
                    <LineChart
                        title="Biểu đồ thể hiện sự biến động giá của các loại bất động sản theo giao dịch Thuê qua thời gian"
                        catagoriesData={catagoriesYear}
                        data={getDataProperty(dataRent)}
                    />
                </div>
            </div>
        </div>
    );
};

PropertyLineChartWrapper.propTypes = {
    data: PropTypes.any,
    catagoriesYear: PropTypes.arrayOf(PropTypes.string),
};
export default PropertyLineChartWrapper;

import React from 'react';
import groupBy from 'lodash.groupby';
import PropTypes from 'prop-types';
import LineChart from '../charts/LineChart';

import { PROPERTY_TYPE_NUMBER } from '../../util/constants';
const BILLION = 1000000;

const PropertyLineChartWrapper = ({ data, catagoriesYear }) => {
    const dataGroupByProperty = groupBy(data?.analytics, (c) => {
        return c.propertyType;
    });
    const getDataProperty = () => {
        const dataResult = [];
        for (const key in dataGroupByProperty) {
            if ({}.hasOwnProperty.call(dataGroupByProperty, key)) {
                const dataProperty = dataGroupByProperty[key].map(
                    (c) => Math.round((c.perMeterAverage / BILLION) * 100) / 100
                );
                // param name and data following Line Chart
                dataResult.push({
                    name: PROPERTY_TYPE_NUMBER[key].wording[0],
                    data: dataProperty,
                });
            }
        }
        return dataResult;
    };

    return (
        <div className="pt-10 pr-4 dark:bg-gray-900 bg-white border border-solid border-light-primary dark:border-primary h-full w-full">
            <LineChart
                title="Biểu đồ thể hiện sự biến động giá của các loại bất động sản qua từng năm"
                catagoriesData={catagoriesYear}
                data={getDataProperty()}
            />
        </div>
    );
};

PropertyLineChartWrapper.propTypes = {
    data: PropTypes.any,
    catagoriesYear: PropTypes.arrayOf(PropTypes.string),
};
export default PropertyLineChartWrapper;

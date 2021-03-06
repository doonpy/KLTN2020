import React from 'react';
import PropTypes from 'prop-types';
import TypePropertyPieChart from './ChartWrapper/TypePropertyPieChart';
import { PROPERTY_TYPE_NUMBER } from '../util/constants';

const TypeTransactionBox = ({ data }) => {
    const resultPropertyData = () => {
        const dataSummary = [];
        data.forEach((item) => {
            const sumArray = {};
            item.summary.forEach((j) => {
                if (
                    !Object.prototype.hasOwnProperty.call(
                        sumArray,
                        j.propertyType
                    )
                ) {
                    sumArray[j.propertyType] = j.amount;
                    return;
                }
                sumArray[j.propertyType] += j.amount;
            });
            dataSummary.push(sumArray);
        });
        const propertyData = [];

        dataSummary.forEach((item) => {
            for (const key of Object.keys(item)) {
                if (!propertyData[key]) {
                    propertyData[key] = item[key];
                    continue;
                }
                propertyData[key] += item[key];
            }
        });

        const totalPropertyData = propertyData.reduce((sum, p) => sum + p, 0);

        const dataPieChart = PROPERTY_TYPE_NUMBER.map((w) => [
            w.wording[0],
            Number((propertyData[w.id] / totalPropertyData) * 100),
        ]).filter((c) => !Number.isNaN(c[1]));

        return dataPieChart;
    };
    return (
        <div className="m-auto h-full mt-4" style={{ maxWidth: '90%' }}>
            <div className="shadow bg-white">
                <TypePropertyPieChart
                    data={resultPropertyData()}
                    title="Biểu đồ thể hiện các loại bất động sản TPHCM (đơn vị %)"
                />
            </div>
        </div>
    );
};

TypeTransactionBox.propTypes = {
    data: PropTypes.arrayOf(PropTypes.any),
};
export default React.memo(TypeTransactionBox);

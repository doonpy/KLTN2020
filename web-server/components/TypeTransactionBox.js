import React from 'react';
import TypePropertyPieChart from './ChartWrapper/TypePropertyPieChart';
import { PROPERTY_TYPE } from '../util/constants';

const TypeTransactionBox = ({ data }) => {
    const resultPropertyData = () => {
        const dataSummary = [];
        data.forEach((item) => {
            const sumArray = {};
            item.summary.forEach((j) => {
                // eslint-disable-next-line no-prototype-builtins
                if (!sumArray.hasOwnProperty(j.propertyType)) {
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
        const dataPieChart = PROPERTY_TYPE.map((w, index) => [w[0], (propertyData[index] / totalPropertyData) * 100]);
        return dataPieChart;
    };

    return (
        <div className="m-0 m-auto h-full mt-4" style={{ maxWidth: '90%' }}>
            <div className="dark:bg-gray-900 bg-white border border-primay border-solid">
                <TypePropertyPieChart data={resultPropertyData()} />
            </div>
        </div>
    );
};

export default React.memo(TypeTransactionBox);

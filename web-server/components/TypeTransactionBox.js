import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import TypePropertyPieChart from './ChartWrapper/TypePropertyPieChart';
import { PROPERTY_TYPE } from '../util/constants';

const TypeTransactionBox = ({ tabs }) => {
    const data = useSelector((state) => state.countDocuments);
    const typeTransationAmount = data.total[tabs].reduce((sum, item, index) => sum + item[index], 0);
    const dataProperty = data.total[tabs].map((item, index) => [
        PROPERTY_TYPE[index][0],
        (item[index] / typeTransationAmount) * 100,
    ]);

    return (
        <div className="m-0 m-auto h-full mt-4" style={{ maxWidth: '90%' }}>
            <div className="bg-gray-900 border border-primay border-solid">
                <TypePropertyPieChart type={tabs} data={dataProperty} />
            </div>
        </div>
    );
};

export default TypeTransactionBox;

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import TypePropertyPieChart from './charts/TypePropertyPieChart';
import { PROPERTY_TYPE } from '../util/constants';

const TabButton = ({ title, onClick, isActive }) => {
    return (
        <>
            <button
                type="button"
                className={`border border-solid border-primay w-full hover:bg-gray-800 ${
                    isActive ? 'border-b-2 border-blue-800' : ''
                }`}
                onClick={onClick}
            >
                {title}
            </button>
        </>
    );
};
const TypeTransactionBox = () => {
    // 0: Bán, 1 : Thuê
    const [tabs, setTabs] = useState(0);
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
            <div className="text-xs w-full flex justify-around">
                <TabButton title="Bán" onClick={() => setTabs(0)} isActive={tabs === 0} />
                <TabButton title="Thuê" onClick={() => setTabs(1)} isActive={tabs === 1} />
            </div>
        </div>
    );
};

export default TypeTransactionBox;

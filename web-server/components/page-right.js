import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import TypeTransactionBox from './TypeTransactionBox';
import TotalByDistrictBarChart from './ChartWrapper/TotalByDistrictBarChart';

const TabButton = ({ title, onClick, isActive }) => {
    return (
        <>
            <button
                type="button"
                className={` w-full hover:bg-gray-800 ${
                    isActive ? 'border-b-2 border-blue-400 py-1' : 'border-b-1  border-primay py-1'
                }`}
                onClick={onClick}
            >
                {title}
            </button>
        </>
    );
};
const PageRight = ({ dataSummary }) => {
    const [tabs, setTabs] = useState(0);
    const key = useSelector((state) => state.mapKey);

    const dataChart = dataSummary.districtSummary.map((data) => {
        const total = data.summary.filter((prop) => prop.propertyType === tabs);
        const dataFilter = [data.district.name, total.length !== 0 ? total[0].amount : 0];
        return dataFilter;
    });

    return (
        <div className="w-3/12 bg-gray-900 border-l border-solid border-primay h-full flex flex-col">
            <div className="bg-gray-900 h-6">
                <div className="text-xs w-full flex justify-around">
                    <TabButton title="Bán" onClick={() => setTabs(0)} isActive={tabs === 0} />
                    <TabButton title="Thuê" onClick={() => setTabs(1)} isActive={tabs === 1} />
                </div>
            </div>
            <div>
                <TypeTransactionBox mapKey={key.mapKey} tabs={tabs} />
            </div>
            <div style={{ height: '50%' }}>
                <TotalByDistrictBarChart mapKey={key.mapKey} tabs={tabs} data={dataChart} />
            </div>
        </div>
    );
};

export default PageRight;

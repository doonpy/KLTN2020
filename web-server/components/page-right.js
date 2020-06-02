import React from 'react';
import TypeTransactionBox from './TypeTransactionBox';
import TotalByDistrictBarChart from './ChartWrapper/TotalByDistrictBarChart';

const TabButton = ({ title, onClick, isActive }) => {
    return (
        <>
            <div
                role="presentation"
                type="button"
                className={` w-full hover:bg-gray-800 text-center cursor-pointer ${
                    isActive
                        ? 'border-b-2 border-blue-400 py-1'
                        : 'border-b-1  border-light-primary dark:border-primary py-1'
                }`}
                onClick={onClick}
            >
                {title}
            </div>
        </>
    );
};
const PageRight = ({ dataSummary, tabs, setTabs }) => {
    const dataChart = dataSummary.map((data) => {
        const dataFilter = [data.name, data.summaryAmount];
        return dataFilter;
    });

    return (
        <div className="w-3/12 dark:bg-gray-900 bg-white border-l border-solid border-light-primary dark:border-primary h-full flex flex-col">
            <div className="dark:bg-gray-900 bg-white h-6">
                <div className="text-xs w-full flex justify-around">
                    <TabButton title="Bán" onClick={() => setTabs(0)} isActive={tabs === 0} />
                    <TabButton title="Tổng" onClick={() => setTabs(2)} isActive={tabs === 2} />
                    <TabButton title="Thuê" onClick={() => setTabs(1)} isActive={tabs === 1} />
                </div>
            </div>
            <div>
                <TypeTransactionBox data={dataSummary} />
            </div>
            <div style={{ height: '50%' }}>
                <TotalByDistrictBarChart data={dataChart} />
            </div>
        </div>
    );
};

export default PageRight;

import React from 'react';
import TypeTransactionBox from './TypeTransactionBox';
import TotalByDistrictBarChart from './ChartWrapper/TotalByDistrictBarChart';
import { TRANSATION_TYPE } from '../util/constants';

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
const PageRight = ({ dataSummary, transactionStage, setTransaction }) => {
    const dataChart = dataSummary.map((data) => {
        const dataFilter = [data.name, data.summaryAmount];
        return dataFilter;
    });

    return (
        <div className="w-3/12 dark:bg-gray-900 bg-white border-l border-solid border-light-primary dark:border-primary h-full flex flex-col">
            <div className="dark:bg-gray-900 bg-white h-6">
                <div className="text-xs w-full flex justify-around">
                    <TabButton
                        title="Bán"
                        onClick={() => setTransaction(TRANSATION_TYPE.SALE)}
                        isActive={transactionStage === TRANSATION_TYPE.SALE}
                    />
                    <TabButton
                        title="Tổng"
                        onClick={() => setTransaction(TRANSATION_TYPE.TOTAL)}
                        isActive={transactionStage === TRANSATION_TYPE.TOTAL}
                    />
                    <TabButton
                        title="Thuê"
                        onClick={() => setTransaction(TRANSATION_TYPE.RENT)}
                        isActive={transactionStage === TRANSATION_TYPE.RENT}
                    />
                </div>
            </div>
            <div style={{ height: 'calc(100vh - 140px)' }}>
                <div style={{ height: '50%' }}>
                    <TypeTransactionBox data={dataSummary} />
                </div>
                <div>
                    <TotalByDistrictBarChart data={dataChart} />
                </div>
            </div>
        </div>
    );
};

export default PageRight;

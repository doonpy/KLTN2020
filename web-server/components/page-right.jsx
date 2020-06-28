import React from 'react';
import PropTypes from 'prop-types';
import TypeTransactionBox from './TypeTransactionBox';
import TotalByDistrictBarChart from './ChartWrapper/TotalByDistrictBarChart';
import { TRANSATION_TYPE } from '../util/constants';

const TabButton = ({ title, onClick, isActive }) => {
    return (
        <>
            <style jsx>{`
                .tab {
                    border-bottom: 1px solid #ebedf3;  
                    width: '100%;
                }
                .txt-white{
                    color: '#fff';
                }
            `}</style>

            <div
                role="presentation"
                type="button"
                className={` w-full tab hover:bg-green-light border-b-1 py-1 text-center cursor-pointer text-dark hover:text-white ${
                    isActive ? 'bg-green-light txt-white' : ''
                }`}
                onClick={onClick}
            >
                {title}
            </div>
        </>
    );
};
const PageRight = ({ dataSummary, transactionStage, setTransaction }) => {
    const dataChart = dataSummary?.map((data) => {
        const dataFilter = [data.name, data.summaryAmount];
        return dataFilter;
    });

    return (
        <div
            className="w-5/12 bg-white  h-full flex flex-col shadow"
            style={{ height: 'calc(100vh - 100px)' }}
        >
            <div className="bg-white h-6">
                <div className="text-xs w-full flex justify-around">
                    <TabButton
                        title="Bán"
                        onClick={() => setTransaction(TRANSATION_TYPE.SALE)}
                        isActive={transactionStage === TRANSATION_TYPE.SALE}
                    />
                    <TabButton
                        title="Thuê"
                        onClick={() => setTransaction(TRANSATION_TYPE.RENT)}
                        isActive={transactionStage === TRANSATION_TYPE.RENT}
                    />
                    <TabButton
                        title="Tổng"
                        onClick={() => setTransaction(TRANSATION_TYPE.TOTAL)}
                        isActive={transactionStage === TRANSATION_TYPE.TOTAL}
                    />
                </div>
            </div>
            <div style={{ height: 'calc(100vh - 140px)', width: '100%' }}>
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
PageRight.propTypes = {
    transactionStage: PropTypes.number,
    dataSummary: PropTypes.arrayOf(PropTypes.any),
    setTransaction: PropTypes.func,
};
TabButton.propTypes = {
    title: PropTypes.string,
    onClick: PropTypes.func,
    isActive: PropTypes.bool,
};
export default PageRight;

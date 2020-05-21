import React from 'react';
import TypeTransactionBox from './TypeTransactionBox';
import TotalByDistrictBarChart from './ChartWrapper/TotalByDistrictBarChart';

const PageRight = () => {
    return (
        <div className="w-3/12 bg-gray-900 border-l border-solid border-primay h-full flex flex-col">
            <div>
                <TypeTransactionBox />
            </div>
            {/* <div style={{ height: '50%' }}>
                <TotalByDistrictBarChart />
            </div> */}
        </div>
    );
};

export default PageRight;

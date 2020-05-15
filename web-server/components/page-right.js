import React from 'react';
import TypeTransactionBox from './TypeTransactionBox';
import TotalByDistrictBarChart from './ChartWrapper/TotalByDistrictBarChart';

const PageRight = () => {
    return (
        <div className="w-3/12 bg-gray-900 border-l border-solid border-primay">
            <TypeTransactionBox />
            <TotalByDistrictBarChart />
            {/* <TotalRealEstate /> */}
            {/* <TypePieChart /> */}
        </div>
    );
};

export default PageRight;

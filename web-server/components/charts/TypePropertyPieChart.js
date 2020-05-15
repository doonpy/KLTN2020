import React from 'react';

import PieChart from './PieChart';

const TypePropertyPieChart = ({ type, data }) => {
    return (
        <div className="m-0 m-auto" style={{ maxWidth: '80%' }}>
            {/* <div className="flex justify-center items-center flex-col">
                <h1 className="font-bold text-center text-lg">Dữ liệu mua</h1>
            </div> */}
            <PieChart data={data} />
        </div>
    );
};

export default TypePropertyPieChart;

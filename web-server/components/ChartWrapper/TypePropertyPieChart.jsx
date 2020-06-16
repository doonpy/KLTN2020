import React from 'react';
import PieChart from '../charts/PieChart';

const TypePropertyPieChart = ({ data }) => {
    return (
        <div className="m-0 m-auto h-full" style={{ maxWidth: '90%' }}>
            <PieChart data={data} />
        </div>
    );
};

export default TypePropertyPieChart;

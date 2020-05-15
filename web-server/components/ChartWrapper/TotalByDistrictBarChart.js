import React from 'react';
import BarChart from '../charts/BarChart';

const TotalByDistrictBarChart = () => {
    return (
        <div className="m-0 m-auto  mt-4" style={{ maxWidth: '90%' }}>
            <div className="bg-gray-900 border border-primay border-solid">
                <div className="m-0 m-auto" style={{ maxWidth: '80%' }}>
                    <BarChart />
                </div>
            </div>
        </div>
    );
};

export default TotalByDistrictBarChart;

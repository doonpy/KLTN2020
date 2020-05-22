import React from 'react';
import useSWR from 'swr';
import { useSelector } from 'react-redux';
import BarChart from '../charts/BarChart';

const TotalByDistrictBarChart = ({ tabs, data }) => {
    return (
        <div className="m-0 m-auto  mt-4" style={{ maxWidth: '' }}>
            <div>
                <div className="m-0 m-auto">
                    <BarChart data={data} />
                </div>
            </div>
        </div>
    );
};

export default TotalByDistrictBarChart;

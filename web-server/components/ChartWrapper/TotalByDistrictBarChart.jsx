import React from 'react';
import BarChart from '../charts/BarChart';

const TotalByDistrictBarChart = ({ data }) => {
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

export default React.memo(TotalByDistrictBarChart);

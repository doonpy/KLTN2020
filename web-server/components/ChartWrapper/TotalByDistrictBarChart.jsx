import React from 'react';
import PropTypes from 'prop-types';
import BarChart from '../charts/BarChart';

const TotalByDistrictBarChart = ({ data }) => {
    return (
        <div className="m-0 m-auto mt-4 " style={{ maxWidth: '' }}>
            <div>
                <div className="m-0 m-auto relative">
                    <BarChart data={data} />
                </div>
            </div>
        </div>
    );
};

TotalByDistrictBarChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.array),
};
export default React.memo(TotalByDistrictBarChart);

import React from 'react';
import PropTypes from 'prop-types';
import BarChart from '../charts/BarChart';

const TotalByDistrictBarChart = ({ data }) => {
    return (
        <div className="m-0 m-auto mt-4 ">
            <div>
                <div className="m-0 m-auto relative">
                    <BarChart
                        data={data}
                        title="Biểu đồ thể hiện số lượng bất động sản theo từng khu vực"
                    />
                </div>
            </div>
        </div>
    );
};

TotalByDistrictBarChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.array),
};
export default React.memo(TotalByDistrictBarChart);

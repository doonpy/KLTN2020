import React from 'react';
import PropTypes from 'prop-types';
import PieChart from '../charts/PieChart';

const TypePropertyPieChart = ({ data }) => {
    return (
        <div className="m-0 m-auto h-full" style={{ maxWidth: '90%' }}>
            <PieChart
                data={data}
                title="Biểu đồ thể hiện các loại bất động sản TPHCM(đơn vị %)"
            />
        </div>
    );
};
TypePropertyPieChart.propTypes = {
    data: PropTypes.any,
};
export default TypePropertyPieChart;

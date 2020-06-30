import React, { useState, useEffect } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import PropTypes from 'prop-types';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import {
    CUSTOM_CHART,
    TURN_OFF_CONTEXT_MENU,
} from '../../custom/custom-charts';
import { SAND_COLOR } from '../../themes/color';

if (typeof Highcharts === 'object') {
    new HighchartsExporting(Highcharts);
    new HighchartsDrilldown(Highcharts);
}

const LineChart = ({ catagoriesData, data, title }) => {
    const TYPE_TEXT = {
        fontSize: '10px',
    };
    const [lineChartOption, setLineChartOption] = useState({
        ...CUSTOM_CHART,
        ...TURN_OFF_CONTEXT_MENU,
        colors: SAND_COLOR,
        title: {
            text: title,
            style: { fontSize: '11px', fontWeight: 600 },
        },
        chart: {
            backgroundColor: 'rgba(0,0,0,0)',
        },
        yAxis: {
            title: {
                text: 'Giá BĐS',
                style: TYPE_TEXT,
            },
            labels: {
                formatter: function (e) {
                    return `${e.value} triệu/m²`;
                },
                style: TYPE_TEXT,
            },
        },

        xAxis: {
            categories: catagoriesData,
            labels: {
                style: TYPE_TEXT,
            },
        },

        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false,
                },
            },
        },
        series: data,
    });

    useEffect(() => {
        setLineChartOption({
            ...lineChartOption,
            xAxis: {
                style: {
                    color: '#fff',
                },
                categories: catagoriesData,
            },
            series: data,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [catagoriesData, data]);
    return (
        <div>
            <HighchartsReact
                highcharts={Highcharts}
                options={lineChartOption}
                containerProps={{
                    style: {
                        maxHeight: '100%',
                    },
                }}
            />
        </div>
    );
};

LineChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    title: PropTypes.string.isRequired,
    catagoriesData: PropTypes.arrayOf(PropTypes.string),
};
export default React.memo(LineChart);

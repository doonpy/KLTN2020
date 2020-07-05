import React, { useState, useEffect } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import PropTypes from 'prop-types';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import {
    CUSTOM_CHART,
    BUTTON_VIEW_FULLSCREEN,
} from '../../custom/custom-charts';
import { DARK_UNICA_COLOR } from '../../themes/color';

if (typeof Highcharts === 'object') {
    new HighchartsExporting(Highcharts);
    new HighchartsDrilldown(Highcharts);
}

const BarChart = ({ data, title }) => {
    const TEXT_COLOR = {
        fontWeight: 600,
    };
    const [barChartOption, setBarChartOption] = useState({
        ...CUSTOM_CHART,
        ...BUTTON_VIEW_FULLSCREEN,
        chart: {
            type: 'column',
            backgroundColor: 'rgba(0,0,0,0)',
        },
        colors: DARK_UNICA_COLOR,
        title: {
            text: title,
            style: {
                fontSize: '13px',
                ...TEXT_COLOR,
            },
        },
        xAxis: {
            type: 'category',
            labels: {
                style: {
                    fontSize: '9px',
                },
            },
        },

        yAxis: {
            min: 0,
            title: {
                text: 'Số lượng (bất động sản)',
                style: {
                    ...TEXT_COLOR,
                },
            },
            labels: {
                style: TEXT_COLOR,
            },
        },

        legend: {
            enabled: false,
        },

        tooltip: {
            pointFormat: '<b>{point.y} bds</b>',
        },
        series: [
            {
                data,
            },
        ],
    });

    useEffect(() => {
        setBarChartOption({
            ...barChartOption,
            series: [
                {
                    name: 'Nghìn (BĐS)',
                    data,
                },
            ],
        });
    }, [data]);

    return (
        <div>
            <HighchartsReact
                highcharts={Highcharts}
                options={barChartOption}
                containerProps={{
                    style: {
                        height: 'calc((100vh - 172px)/2)',
                    },
                }}
            />
        </div>
    );
};

BarChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.array),
    title: PropTypes.string,
};
export default React.memo(BarChart);

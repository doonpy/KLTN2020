import React, { useState, useEffect } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import PropTypes from 'prop-types';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import { CUSTOM_CHART } from '../../custom/custom-charts';

if (typeof Highcharts === 'object') {
    new HighchartsExporting(Highcharts);
    new HighchartsDrilldown(Highcharts);
}

const BarChart = ({ data }) => {
    const [barChartOption, setBarChartOption] = useState({
        // ...BINDING_OPTIONS,
        ...CUSTOM_CHART,

        chart: {
            type: 'bar',
            backgroundColor: 'rgba(0,0,0,0)',
        },
        title: {
            text: 'Biểu đồ thể hiện số lượng bất động sản theo từng khu vực',
            style: {
                fontSize: '10px',
                color: '#ffffff',
            },
        },
        xAxis: {
            type: 'category',
            labels: {
                style: {
                    fontSize: '6px',
                    color: '#ffffff',
                },
            },
        },

        yAxis: {
            min: 0,
            title: {
                text: 'Số lượng (bất động sản)',
                style: {
                    fontSize: '9px',
                    color: '#ffffff',
                },
            },
            labels: {
                style: {
                    color: '#ffffff',
                },
            },
        },

        legend: {
            enabled: false,
        },

        exporting: {
            buttons: {
                contextButton: {
                    menuItems: ['viewFullscreen'],
                    symbolX: 8,
                    symbolY: 8,
                    symbol: 'square',
                    symbolSize: 11,
                    height: 16,
                    width: 16,
                },
            },
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
};
export default React.memo(BarChart);

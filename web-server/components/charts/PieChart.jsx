import React, { useState, useEffect } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting';
import PropTypes from 'prop-types';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import { SAND_COLOR } from '../../themes/color';
import {
    CUSTOM_CHART,
    TURN_OFF_CONTEXT_MENU,
} from '../../custom/custom-charts';

if (typeof Highcharts === 'object') {
    new HighchartsExporting(Highcharts);
    new HighchartsDrilldown(Highcharts);
}

const PieChart = ({ data, title }) => {
    const TEXT_STYLE = {
        fontSize: '13px',
        fontWeight: 600,
    };
    const [chartOptions, setChartOptions] = useState({
        ...CUSTOM_CHART,
        ...TURN_OFF_CONTEXT_MENU,
        chart: {
            type: 'pie',
        },
        colors: SAND_COLOR,
        title: {
            text: title,
            style: TEXT_STYLE,
        },
        legend: {
            enabled: true,
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            itemMarginLeft: 10,
        },
        tooltip: {
            pointFormat: ' <b>{series.name}:</b><b>{point.percentage:.1f}%</b>',
        },
        accessibility: {
            point: {
                valueSuffix: '%',
            },
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false,
                },
                showInLegend: true,
            },
            series: {
                dataLabels: {
                    color: '#F0F0F3',
                    style: {
                        fontSize: '13px',
                    },
                },
                marker: {
                    lineColor: '#333',
                },
            },
            boxplot: {
                fillColor: '#505053',
            },
            candlestick: {
                lineColor: 'white',
            },
            errorbar: {
                color: 'white',
            },
        },
        series: [
            {
                name: 'Tỷ lệ',
                colorByPoint: true,
            },
        ],
    });

    useEffect(() => {
        setChartOptions({
            ...chartOptions,
            series: [
                {
                    name: 'Tỷ lệ',
                    colorByPoint: true,
                    data,
                },
            ],
        });
    }, [data]);
    return (
        <div className="relative z-1000">
            <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
                containerProps={{
                    style: {
                        height: 'calc((100vh - 172px)/2)',
                    },
                }}
            />
        </div>
    );
};

PieChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.array),
    title: PropTypes.string,
};
export default React.memo(PieChart);

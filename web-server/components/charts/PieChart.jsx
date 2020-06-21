import React, { useState, useEffect } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting';
import PropTypes from 'prop-types';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import { CUSTOM_CHART } from '../../custom/custom-charts';

if (typeof Highcharts === 'object') {
    new HighchartsExporting(Highcharts);
    new HighchartsDrilldown(Highcharts);
}

const PieChart = ({ data }) => {
    const [chartOptions, setChartOptions] = useState({
        ...CUSTOM_CHART,
        navigation: {
            buttonOptions: {
                enabled: false,
            },
        },
        chart: {
            type: 'pie',
            backgroundColor: 'rgba(0,0,0,0)',
            height: '100%',
        },

        title: {
            text: 'Biểu đồ thể hiện các loại bất động sản TPHCM (đơn vị %)',
            style: {
                fontSize: '10px',
                color: '#ffffff',
            },
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
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
    );
};

PieChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.array),
};
export default React.memo(PieChart);

import React, { useState, useEffect } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import PropTypes from 'prop-types';
import { numberWithCommas } from '../../util/services/helper';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import { CUSTOM_CHART } from '../../custom/custom-charts';

if (typeof Highcharts === 'object') {
    new HighchartsExporting(Highcharts);
    new HighchartsDrilldown(Highcharts);
}

const ParetoChart = ({ categoriesData, ammountData, priceData }) => {
    const [paretoChartOption, setParetoChartOption] = useState({
        ...CUSTOM_CHART,
        navigation: {
            buttonOptions: {
                enabled: false,
            },
        },
        chart: {
            zoomType: 'xy',
            backgroundColor: 'rgba(0,0,0,0)',
        },
        title: {
            text:
                'Biểu đồ thể hiện giá trung bình và số lượng bất động sản trung bình của TPHCM theo từng (tháng) năm',
            style: {
                color: '#ffffff',
                fontSize: '12px',
            },
        },

        xAxis: [
            {
                categories: categoriesData,
                crosshair: true,
            },
        ],
        yAxis: [
            {
                labels: {
                    formatter: function (e) {
                        return `${numberWithCommas(e.value)} tr/m²`;
                    },
                    style: {
                        color: '#ffffff',
                    },
                },
                title: {
                    text: 'Giá BĐS',
                    style: {
                        color: '#ffffff',
                    },
                },
            },
            {
                title: {
                    text: 'Số lượng',
                    style: {
                        color: '#ffffff',
                    },
                },
                labels: {
                    format: '{value}',
                    style: {
                        color: '#ffffff',
                    },
                },
                opposite: true,
            },
        ],
        tooltip: {
            shared: true,
        },

        series: [
            {
                name: 'Số lượng',
                type: 'column',
                yAxis: 1,
                data: ammountData,
                tooltip: {
                    valueSuffix: ' BĐS',
                },
            },
            {
                name: 'Giá',
                type: 'spline',
                data: priceData,
                tooltip: {
                    valueSuffix: ' tr/m²',
                },
            },
        ],
    });
    useEffect(() => {
        setParetoChartOption({
            ...paretoChartOption,
            xAxis: [
                {
                    categories: categoriesData,
                    crosshair: true,
                },
            ],
            series: [
                {
                    name: 'Số lượng',
                    type: 'column',
                    yAxis: 1,
                    data: ammountData,
                    tooltip: {
                        valueSuffix: ' BĐS',
                    },
                },
                {
                    name: 'Giá',
                    type: 'spline',
                    data: priceData,
                    tooltip: {
                        valueSuffix: ' tr/m²',
                    },
                },
            ],
        });
    }, [categoriesData, ammountData, priceData]);
    return (
        <div>
            <HighchartsReact
                highcharts={Highcharts}
                options={paretoChartOption}
                containerProps={{
                    style: {
                        maxHeight: '100%',
                    },
                }}
            />
        </div>
    );
};
ParetoChart.propTypes = {
    categoriesData: PropTypes.arrayOf(PropTypes.any),
    ammountData: PropTypes.arrayOf(PropTypes.any),
    priceData: PropTypes.arrayOf(PropTypes.any),
};
export default ParetoChart;

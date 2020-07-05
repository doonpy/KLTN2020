import React, { useState, useEffect } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import PropTypes from 'prop-types';
import { numberWithCommas } from '../../util/services/helper';
import HighchartsExporting from 'highcharts/modules/exporting';
import { SAND_COLOR } from '../../themes/color';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import {
    CUSTOM_CHART,
    TURN_OFF_CONTEXT_MENU,
} from '../../custom/custom-charts';

if (typeof Highcharts === 'object') {
    new HighchartsExporting(Highcharts);
    new HighchartsDrilldown(Highcharts);
}

const ParetoChart = ({ categoriesData, ammountData, priceData, title }) => {
    const TYPE_TEXT = {
        fontSize: '10px',
    };
    const [paretoChartOption, setParetoChartOption] = useState({
        ...CUSTOM_CHART,
        ...TURN_OFF_CONTEXT_MENU,
        colors: SAND_COLOR,
        chart: {
            zoomType: 'xy',
            backgroundColor: 'rgba(0,0,0,0)',
        },
        title: {
            text: title,
            style: TYPE_TEXT,
        },

        xAxis: [
            {
                categories: categoriesData,
                labels: {
                    style: TYPE_TEXT,
                },
                crosshair: true,
            },
        ],
        yAxis: [
            {
                labels: {
                    formatter: function (e) {
                        return `${numberWithCommas(e.value)} tr/m²`;
                    },
                    style: TYPE_TEXT,
                },
                title: {
                    text: 'Giá BĐS',
                    style: TYPE_TEXT,
                },
            },
            {
                title: {
                    text: 'Số lượng',
                    style: TYPE_TEXT,
                },
                labels: {
                    format: '{value}',
                    style: TYPE_TEXT,
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
    title: PropTypes.string,
};
export default React.memo(ParetoChart);

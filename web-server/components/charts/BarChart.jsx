import React, { useState, useEffect } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import { BINDING_OPTIONS } from '../../util/bindingOptions';

if (typeof Highcharts === 'object') {
    new HighchartsExporting(Highcharts);
    new HighchartsDrilldown(Highcharts);
}

const BarChart = ({ data, mapKey }) => {
    const [barChartOption, setBarChartOption] = useState({
        ...BINDING_OPTIONS,
        chart: {
            type: 'column',
            backgroundColor: 'rgba(0,0,0,0)',
            height: '70%',
        },
        title: {
            text: 'Tổng bất động sản',
            style: {
                fontSize: '12px',
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
                    fontSize: '6px',
                    color: '#ffffff',
                },
            },
            labels: {
                style: {
                    fontSize: '6px',
                    color: '#ffffff',
                },
            },
        },

        legend: {
            enabled: false,
        },
        responsive: {
            rules: [
                {
                    condition: {
                        maxWidth: 500,
                    },
                },
            ],
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
    }, [barChartOption, data]);
    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={barChartOption} />
        </div>
    );
};

export default React.memo(BarChart);

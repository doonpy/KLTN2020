import React, { useState } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import { BINDING_OPTIONS } from '../../util/bindingOptions';

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HighchartsDrilldown(Highcharts);
}

const BarChart = () => {
    const [barChartOption, setBarChartOption] = useState({
        ...BINDING_OPTIONS,
        chart: {
            type: 'column',
            backgroundColor: 'rgba(0,0,0,0)',
            height: '70%',
        },
        title: {
            text: 'Tổng bất động sản theo quận',
        },
        xAxis: {
            type: 'category',
            labels: {
                rotation: -45,
                style: {
                    fontSize: '8px',
                },
            },
        },
        yAxis: {
            min: 0,
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
                    // chartOptions: {
                    //     legend: {
                    //         align: 'center',
                    //         verticalAlign: 'bottom',
                    //         layout: 'horizontal',
                    //     },
                    // },
                },
            ],
        },
        tooltip: {
            pointFormat: 'Population in 2008: <b>{point.y:.1f} millions</b>',
        },
        series: [
            {
                name: 'Nghìn (BĐS)',
                data: [
                    ['Quận 1', 23.7],
                    ['Quận 2', 16.1],
                    ['Quận 3', 14.2],
                    ['Quận 4', 14.0],
                    ['Quận 5', 12.5],
                    ['Quận 6', 12.1],
                    ['Quận 7', 11.8],
                    ['Quận 8', 11.7],
                    ['Quận 9', 11.1],
                    ['Quận 10', 11.1],
                    ['Quận 11', 10.5],
                    ['Quận 12', 10.4],
                    ['Huyện Bình Chánh', 10.0],
                    ['Huyện Hóc Môn', 1.3],
                    ['Quận Phú Nhuận', 9.3],
                    ['Quận Thủ Đức', 9.0],
                    ['Quận Tân Phú', 7.9],
                    ['Quận Tân Bình', 9.9],
                    ['Quận Gò Vấp', 8.9],
                ],
            },
        ],
    });
    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={barChartOption} />
        </div>
    );
};

export default BarChart;

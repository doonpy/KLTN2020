import React, { useState, useEffect } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import { BINDING_OPTIONS } from '../../util/bindingOptions';

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HighchartsDrilldown(Highcharts);
}

const PieChart = ({ data }) => {
    const [chartOptions, setChartOptions] = useState({
        ...BINDING_OPTIONS,
        chart: {
            type: 'pie',
            backgroundColor: 'rgba(0,0,0,0)',
            height: '100%',
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
                // showInLegend: true,
            },
            series: {
                cursor: 'pointer',
                // events: {
                //     mouseOver: () => updateSeries(),
                // },
            },
        },
        series: [
            {
                name: 'Tỷ lệ',
                colorByPoint: true,
                // data in props
                data,
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
        <div>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
    );
};

export default PieChart;

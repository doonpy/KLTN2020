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

const PieChart = ({ data }) => {
    const [chartOptions, setChartOptions] = useState({
        ...BINDING_OPTIONS,
        chart: {
            type: 'pie',
            backgroundColor: 'rgba(0,0,0,0)',
            height: '100%',
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            itemMarginLeft: 10,
            // itemMarginBottom: 10,
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
                // size: '70%',
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

export default PieChart;

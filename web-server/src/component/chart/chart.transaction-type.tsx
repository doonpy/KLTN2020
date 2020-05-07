import React from 'react';
import Highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';
import HighchartsDrilldown from 'highcharts/modules/drilldown';

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HighchartsDrilldown(Highcharts);
}

const TransactionTypeChart = ({
    name,
    data,
    drilldown,
}: {
    name: string;
    data: { name: string; y: number; drilldown?: string }[];
    drilldown: { name: string; id: string; data: [string, number][] }[];
}): JSX.Element => {
    const options: Highcharts.Options = {
        chart: {
            type: 'pie',
        },
        title: {
            text: 'Browser market shares. January, 2018',
        },
        subtitle: {
            text:
                'Click the slices to view versions. Source: <a href="http://statcounter.com" target="_blank">statcounter.com</a>',
        },

        accessibility: {
            announceNewData: {
                enabled: true,
            },
            point: {
                valueDescriptionFormat: '%',
            },
        },

        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.y:.1f}%',
                },
            },
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>',
        },

        series: [
            {
                type: 'pie',
                name,
                colorByPoint: true,
                data,
            },
        ],
        drilldown: {
            series: drilldown.map((item) => Object({ type: 'pie', name: item.name, id: item.id, data: item.data })),
        },
    };
    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default TransactionTypeChart;

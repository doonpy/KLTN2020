import React from 'react';
import Highmaps from 'highcharts/highmaps';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import HighchartsReact from 'highcharts-react-official';
import mapData from './geojson/hcm/district.geo.json';

if (typeof Highmaps === 'object') {
    HighchartsExporting(Highmaps);
    HighchartsDrilldown(Highmaps);
}

const getOptions = () => {
    const data = [...mapData.features];
    data.forEach((feature, index) => {
        feature.key = feature['hc-key'];
        feature.value = index;
    });

    return {
        chart: {
            height: '50%',
        },
        title: {
            text: 'Highcharts Map Drilldown',
        },

        subtitle: {
            text: '',
            floating: true,
            align: 'right',
            y: 50,
            style: {
                fontSize: '16px',
            },
        },

        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
        },

        colorAxis: {
            min: 0,
            minColor: '#E6E7E8',
            maxColor: '#005645',
        },

        mapNavigation: {
            enabled: true,
            buttonOptions: {
                verticalAlign: 'bottom',
            },
        },

        plotOptions: {
            map: {
                states: {
                    hover: {
                        color: '#EEDD66',
                    },
                },
            },
        },
        series: [
            {
                data: data,
                mapData: mapData,
                joinBy: ['hc-key', 'key'],
                name: 'Random data',
                states: {
                    hover: {
                        color: Highmaps.getOptions().colors[2],
                    },
                },
                dataLabels: {
                    enabled: true,
                    // formatter: function() {
                    //     return mapKey === 'custom/world' || mapKey === 'countries/us/us-all' ?
                    //         (this.point.properties && this.point.properties['hc-a2']) :
                    // :
                    //     this.point.name;
                    // },
                },
                point: {
                    events: {
                        // On click, look for a detailed map
                        click: function() {
                            const key = this.key;
                            console.log(key);
                        },
                    },
                },
            },
        ],
    };
};

const ClusterMap = () => {
    const mapOptions = getOptions();
    return <HighchartsReact constructorType="mapChart" highcharts={Highmaps} options={mapOptions}/>;
};

export default ClusterMap;

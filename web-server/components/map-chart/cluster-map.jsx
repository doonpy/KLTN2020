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
        feature.drilldown = feature['osm-relation-id'];
        feature.value = index;
    });

    return {
        chart: {
            map: mapData,
            height: '50%',
            events: {
                drilldown: function (e) {
                    console.log(e);
                },
            },
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
                data,
                name: 'HCM',
                dataLabels: {
                    enabled: true,
                    format: '{point.properties.name}',
                },
            },
        ],
        drilldown: {
            activeDataLabelStyle: {
                color: '#FFFFFF',
                textDecoration: 'none',
                textOutline: '1px #000000',
            },
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    x: 0,
                    y: 60,
                },
            },
        },
    };
};

const ClusterMap = () => {
    const mapOptions = getOptions();
    return <HighchartsReact constructorType="mapChart" highcharts={Highmaps} options={mapOptions} />;
};

export default ClusterMap;

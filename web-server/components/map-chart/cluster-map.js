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
    const data = mapData.features.map((feature) => {
        return { id: feature['osm-relation-id'], name: feature.name };
    });

    return {
        chart: {
            height: '50%',
        },
        title: {
            text: ' ',
        },
        credits: {
            enabled: false,
        },
        mapNavigation: {
            enabled: true,
        },
        // plotOptions: {
        //     map: {
        //         allAreas: false,
        //         dataLabels: {
        //             enabled: true,
        //             color: 'white',
        //             style: {
        //                 fontWeight: 'bold',
        //             },
        //         },
        //         mapData,
        //         tooltip: {
        //             headerFormat: '',
        //             pointFormat: '{point.name}: <b>{series.name}</b>',
        //         },
        //     },
        // },
        series: [
            {
                data,
                mapData,
                joinBy: ['osm-relation-id', 'id'],
                showInLegend: false,
                dataLabels: {
                    enabled: true,
                    format: '{point.properties.name}',
                },
                states: {
                    hover: {
                        color: '#a4edba',
                    },
                },
            },
        ],
    };
};

const ClusterMap = () => {
    const mapOptions = getOptions();
    return <HighchartsReact constructorType="mapChart" highcharts={Highmaps} options={mapOptions} />;
};

export default ClusterMap;

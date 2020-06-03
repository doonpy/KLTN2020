import React from 'react';
import Highcharts, { Chart } from 'highcharts/highmaps';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';
import proj4 from 'proj4';
import request from '../../util/api/request';

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
}

// NOTE: when dealing with server side rendering as we are, check for window before doing things with it.
// If you're not doing server side rendering, then you don't need this check and can just assign straight to window.
if (typeof window !== 'undefined') {
    window.proj4 = window.proj4 || proj4;
}

/**
 * @param {Chart} chart
 */
async function loadData(chart) {
    const data = await request.get('/api/v1/vi/raw-dataset?address=');
}

/**
 * Get highmaps options
 */
const getOptions = (mapData, rawDataset) => {
    rawDataset.forEach((rawData) => {
        rawData.lat = rawData.coordinate.lat;
        rawData.lon = rawData.coordinate.lng;
    });

    return {
        chart: {
            height: '50%',
            map: mapData,
            borderWidth: 1,
            // events: {
            //     load: async function (event) {
            //         const chart = event.target;
            //         chart.setTitle(null, { text: mapData.features[0].properties.name });
            //         const { rawDataset } = await request.get(
            //             `/api/v1/vi/raw-dataset?limit=500&populate=1&address=${mapData.features[0].properties.name}`
            //         );
            //         rawDataset.forEach((rawData) => {
            //             rawData.lat = rawData.coordinate.lat;
            //             rawData.lon = rawData.coordinate.lng;
            //         });
            //         console.log(rawDataset);
            //         chart.addSeries({
            //             type: 'mappoint',
            //             enableMouseTracking: true,
            //             colorKey: 'clusterPointsAmount',
            //             name: 'Cities',
            //             data: rawDataset,
            //         });
            //     },
            // },
        },
        title: {
            text: 'Detail',
        },
        credits: {
            enabled: false,
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
        },
        mapNavigation: {
            enabled: true,
            enableDoubleClickZoomTo: true,
        },
        tooltip: {
            headerFormat: '',
            pointFormat:
                '<b>{point.title}</b><br><b>{point.address}</b><br>Lat: {point.lat}, Lon: {point.lon}',
        },
        colorAxis: {
            min: 0,
            max: 20,
        },
        plotOptions: {
            mappoint: {
                cluster: {
                    enabled: true,
                    allowOverlap: false,
                    animation: {
                        duration: 450,
                    },
                    layoutAlgorithm: {
                        type: 'grid',
                        gridSize: 70,
                    },
                    zones: [
                        {
                            from: 1,
                            to: 4,
                            marker: {
                                radius: 13,
                            },
                        },
                        {
                            from: 5,
                            to: 9,
                            marker: {
                                radius: 15,
                            },
                        },
                        {
                            from: 10,
                            to: 15,
                            marker: {
                                radius: 17,
                            },
                        },
                        {
                            from: 16,
                            to: 20,
                            marker: {
                                radius: 19,
                            },
                        },
                        {
                            from: 21,
                            to: 100,
                            marker: {
                                radius: 21,
                            },
                        },
                    ],
                },
            },
        },
        series: [
            {
                name: 'Basemap',
                borderColor: '#A0A0A0',
                nullColor: 'rgba(177, 244, 177, 0.5)',
                showInLegend: false,
            },
            {
                type: 'mappoint',
                enableMouseTracking: true,
                colorKey: 'clusterPointsAmount',
                name: 'Cities',
                dataLabels: false,
                data: rawDataset,
            },
        ],
    };
};

const MapChartDetail = ({ mapData, rawDataset }) => {
    const mapOptions = getOptions(mapData, rawDataset);
    return (
        <HighchartsReact
            constructorType="mapChart"
            highcharts={Highcharts}
            options={mapOptions}
        />
    );
};

export default MapChartDetail;

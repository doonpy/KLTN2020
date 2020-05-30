import React from 'react';
import Highcharts, { DrilldownEventObject, DrillupAllEventObject } from 'highcharts/highmaps';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import HighchartsReact from 'highcharts-react-official';
import { fetchMapData } from '../../lib/map-chart/helper';

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HighchartsDrilldown(Highcharts);
}

/**
 * @param {	DrilldownEventObject} event
 *
 * @return {Promise<void>}
 */
async function drilldownHandler(event) {
    if (!event.seriesOptions) {
        const chart = this;
        const districtKey = event.point.drilldown;
        let failChecking = setTimeout(() => {
            chart.showLoading(`Failed to loading ${event.point.name}`);
            failChecking = setTimeout(() => chart.hideLoading(), 3000);
        }, 5000);

        this.showLoading('Đợi xíu...');
        const mapData = await fetchMapData(`hcm/district/${districtKey}`);
        const data = mapData.features.map((feature, index) => {
            feature.value = index;
            feature.mapKey = feature.properties['hc-key'];
            return feature;
        });

        chart.hideLoading();
        clearTimeout(failChecking);
        chart.setTitle(null, { text: event.point.name });
        chart.addSeriesAsDrilldown(event.point, {
            mapData,
            name: event.point.name,
            data,
            joinBy: ['hc-key', 'mapKey'],
            dataLabels: {
                enabled: true,
                color: '#FFFFFF',
                format: '{point.properties.name}',
            },
            showInLegend: false,
            events: {
                click: (e) => {
                    window.location.href = `/map-detail/${districtKey}/${e.point.mapKey}`;
                },
            },
            tooltip: {
                headerFormat: '',
                pointFormat: '{point.properties.name}',
            },
        });
    }
}

/**
 * @param { DrillupAllEventObject } event
 */
function drillupHandler(event) {
    this.setTitle(null, { text: '' });
}

/**
 * Get highmaps options
 */
const getOptions = (mapData) => {
    const data = mapData.features.map((feature, index) => {
        feature.drilldown = feature.properties['hc-key'];
        feature.value = index;
        feature.code = feature.properties['osm-relation-id'];
        return feature;
    });
    // console.log(data);
    const mockData = [...data].map((item) => {
        return { value: Math.random() * 100, code: item.properties['hc-key'] };
    });

    return {
        chart: {
            height: '50%',
            borderWidth: 1,
            events: {
                drilldown: drilldownHandler,
                drillup: drillupHandler,
            },
            map: mapData,
        },
        title: {
            text: 'Overview',
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
        plotOptions: {
            map: {
                states: {
                    hover: {
                        color: '#EEDD66',
                    },
                },
            },
        },
        colorAxis: {
            min: 1,
            type: 'logarithmic',
            minColor: '#EEEEFF',
            maxColor: '#000022',
            stops: [
                [0, '#EFEFFF'],
                [0.67, '#4444FF'],
                [1, '#000022'],
            ],
        },
        series: [
            // {
            //     mapData,
            // data,
            // name: 'HCM',
            // joinBy: ['osm-relation-id', 'code'],
            // dataLabels: {
            //     enabled: true,
            //     color: '#FFFFFF',
            //     format: '{point.properties.name}',
            // },
            // showInLegend: false,
            // tooltip: {
            //     headerFormat: '',
            //     pointFormat: '{point.properties.name}',
            // },
            // },
            {
                animation: {
                    duration: 1000,
                },
                data: mockData,
                joinBy: ['hc-key', 'code'],
                dataLabels: {
                    enabled: true,
                    color: '#FFFFFF',
                    format: '{point.code}',
                },
                name: 'Population density',
                // tooltip: {
                //     pointFormat: '{point.code}: {point.value}/km²',
                // },
            },
        ],
        // drilldown: {
        //     activeDataLabelStyle: {
        //         color: '#FFFFFF',
        //         textDecoration: 'none',
        //         textOutline: '1px #000000',
        //     },
        //     drillUpButton: {
        //         relativeTo: 'spacingBox',
        //         position: {
        //             x: 0,
        //             y: 60,
        //         },
        //     },
        // },
    };
};

const MapChartOverview = ({ mapData }) => {
    const mapOptions = getOptions(mapData);
    return <HighchartsReact constructorType="mapChart" highcharts={Highcharts} options={mapOptions} />;
};

export default MapChartOverview;

import React, { useState, useEffect, useRef } from 'react';
import Highcharts, { DrilldownEventObject, DrillupAllEventObject } from 'highcharts/highmaps';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import HighchartsReact from 'highcharts-react-official';
import { fetchMapData } from '../../lib/map-chart/helper';
import { BINDING_OPTIONS } from '../../util/bindingOptions';

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HighchartsDrilldown(Highcharts);
}

const MapOverview = ({ mapData, data }) => {
    const chartRef = useRef();
    const handleDrillUp = async (event) => {
        const { chart } = chartRef.current;
        chart.setTitle(null, { text: '' });
    };
    const handleDrilldownMap = async (event) => {
        const { chart } = chartRef.current;
        event.preventDefault();
        if (!event.seriesOptions) {
            try {
                const mapKey = event.point.drilldown;
                let failChecking = setTimeout(() => {
                    chart.showLoading(`Failed to loading ${event.point.name}`);
                    failChecking = setTimeout(() => chart.hideLoading(), 3000);
                }, 5000);
                chart.showLoading('liadn');
                const mapDataDistrict = await fetchMapData(mapKey);

                const dataDistrict = mapDataDistrict.features.map((feature, index) => {
                    feature.value = index;
                    feature.mapKey = feature.properties['hc-key'];
                    return feature;
                });
                chart.hideLoading();
                clearTimeout(failChecking);
                await chart.setTitle(null, { text: event.point.name });
                await chart.addSeriesAsDrilldown(event.point, {
                    name: event.point.name,
                    mapData: mapDataDistrict,
                    data: dataDistrict,
                    joinBy: ['hc-key', 'mapKey'],
                    dataLabels: {
                        enabled: true,
                        color: '#FFFFFF',
                        format: '{point.properties.name}',
                        event,
                    },
                    showInLegend: false,
                    tooltip: {
                        headerFormat: '',
                        pointFormat: '{point.properties.name}',
                    },
                    mapNavigation: {
                        enabled: true,
                    },
                });
            } catch (err) {
                //
            }
        }
    };
    const mapOptions = {
        ...BINDING_OPTIONS,
        chart: {
            type: 'map',
            backgroundColor: 'rgba(0,0,0,0)',
            events: {
                drilldown: handleDrilldownMap,
                drillup: handleDrillUp,
            },
        },
        credits: {
            enabled: false,
        },
        colors: ['#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'],
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
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
                mapData,
                data,
                name: 'HCM',
                joinBy: ['osm-relation-id', 'code'],
                dataLabels: {
                    enabled: true,
                    color: '#FFFFFF',
                    format: '{point.properties.name}',
                },
                allowPointSelect: true,
                cursor: 'pointer',
                showInLegend: false,
                tooltip: {
                    headerFormat: '',
                    pointFormat: '{point.properties.name}',
                },
            },
        ],
    };

    return (
        <HighchartsReact
            ref={chartRef}
            containerProps={{ style: { height: 'calc(100vh - 100px)' } }}
            constructorType="mapChart"
            highcharts={Highcharts}
            options={mapOptions}
        />
    );
};

export default MapOverview;

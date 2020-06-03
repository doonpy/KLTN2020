import React, { useRef, useState } from 'react';
import Highcharts from 'highcharts/highmaps';
import HighchartsExporting from 'highcharts/modules/exporting';
import { useDispatch } from 'react-redux';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import HighchartsReact from 'highcharts-react-official';
import { BINDING_OPTIONS } from '../../util/bindingOptions';
import * as action from '../../store/map-key/actions';

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HighchartsDrilldown(Highcharts);
}

const MapOverview = ({ mapData, dataMap, setStage }) => {
    const dispatch = useDispatch();
    const chartRef = useRef();

    const handleDrilldownMap = async (event) => {
        event.preventDefault();
        if (!event.seriesOptions) {
            const mapKey = event.point.drilldown;
            await dispatch(action.fetchMapKey(mapKey));
            setStage(1);
        }
    };

    const mapOptions = {
        ...BINDING_OPTIONS,
        chart: {
            type: 'map',
            backgroundColor: 'rgba(0,0,0,0)',
            events: {
                drilldown: handleDrilldownMap,
            },
        },
        credits: {
            enabled: false,
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
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'right',
            backgroundColor: 'rgba(0,0,0,0)',
            y: 35,
        },
        // legend: {
        //     layout: 'horizontal',
        //     borderWidth: 0,
        //     backgroundColor: 'rgba(0,0,0,0)',
        //     floating: true,
        //     verticalAlign: 'top',
        //     // y: 25,
        // },
        series: [
            {
                mapData,
                data: dataMap,
                name: 'HCM',
                joinBy: ['hc-key', 'hc-key'],
                dataLabels: {
                    enabled: true,
                    color: '#FFFFFF',
                    format: '{point.name}',
                },
                allowPointSelect: true,
                cursor: 'pointer',
                showInLegend: false,
                tooltip: {
                    pointFormat: '{point.name}: {point.value:.1f} bds/km2',
                },
            },
        ],
    };

    return dataMap ? (
        <HighchartsReact
            ref={chartRef}
            containerProps={{ style: { height: 'calc(100vh - 100px)' } }}
            constructorType="mapChart"
            highcharts={Highcharts}
            options={mapOptions}
        />
    ) : null;
};

export default MapOverview;

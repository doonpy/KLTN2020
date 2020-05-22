import React, { useRef } from 'react';
import Highcharts, { DrilldownEventObject, DrillupAllEventObject } from 'highcharts/highmaps';
import HighchartsExporting from 'highcharts/modules/exporting';
import { useDispatch } from 'react-redux';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import HighchartsReact from 'highcharts-react-official';
import { fetchMapData } from '../../lib/map-chart/helper';
import { BINDING_OPTIONS } from '../../util/bindingOptions';
import * as action from '../../store/map-key/actions';

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HighchartsDrilldown(Highcharts);
}

const MapOverview = ({ mapData, dataSummary }) => {
    const dispatch = useDispatch();
    const dataMap = dataSummary.districtSummary.map((district) => {
        const realEstateDensity = Number(district.summaryAmount) / Number(district.district.acreage);
        return {
            value: realEstateDensity,
            drilldown: district.district.code,
            'hc-key': district.district.code,
            name: district.district.name,
        };
    });

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
                await dispatch(action.fetchMapKey(mapKey));
                let failChecking = setTimeout(() => {
                    chart.showLoading(`Failed to loading ${event.point.name}`);
                    failChecking = setTimeout(() => chart.hideLoading(), 3000);
                }, 5000);
                chart.showLoading('liadn');

                const mapDataDistrict = await fetchMapData(mapKey);
                const dataWardFilter = dataSummary.districtWardSummary.filter((data) => data.district.code === mapKey);

                const dataWard = dataWardFilter.map((ward) => {
                    const realEstateDensity = Number(ward.summaryAmount) / Number(ward.district.acreage);
                    return {
                        value: realEstateDensity,
                        drilldown: ward.ward.code,
                        'hc-key': ward.ward.code,
                        name: ward.ward.name,
                    };
                });

                chart.hideLoading();
                clearTimeout(failChecking);
                await chart.setTitle(null, { text: event.point.name });
                await chart.addSeriesAsDrilldown(event.point, {
                    name: event.point.name,
                    mapData: mapDataDistrict,
                    data: dataWard,
                    joinBy: ['hc-key', 'hc-key'],
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

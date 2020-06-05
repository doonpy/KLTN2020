import React, { useRef, useState, useEffect } from 'react';
import Highcharts from 'highcharts/highmaps';
import HighchartsExporting from 'highcharts/modules/exporting';
import { useDispatch, useSelector } from 'react-redux';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import HighchartsReact from 'highcharts-react-official';
import LoadingIcon from '../LoadingIcon';
import { fetchMapData } from '../../util/api/fetchMapJson';
import * as action from '../../store/map-key/actions';

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HighchartsDrilldown(Highcharts);
}

const MapWard = ({ dataWard, setStage }) => {
    const [wardMap, setWardMap] = useState(null);
    const { mapKey } = useSelector((state) => state.mapKey);
    const dispatch = useDispatch();

    const fetchData = async () => {
        const res = await fetchMapData(mapKey);
        setWardMap(res);
    };
    useEffect(() => {
        fetchData();
    }, []);
    const backToMapDistrict = async () => {
        await dispatch(action.fetchMapKey('full'));
        setStage(0);
    };

    const mapOptions = {
        chart: {
            type: 'map',
            backgroundColor: 'rgba(0,0,0,0)',
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
        exporting: {
            buttons: [
                {
                    text: 'Back to HCM',
                    onclick() {
                        backToMapDistrict();
                    },
                    theme: {
                        'stroke-width': 1,
                        stroke: 'silver',
                        r: 0,
                        states: {
                            select: {
                                stroke: '#039',
                                fill: '#a4edba',
                            },
                        },
                    },
                },
            ],
        },
        series: [
            {
                mapData: wardMap,
                data: dataWard,
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
        <>
            {wardMap ? (
                <div style={{ height: 'calc(100vh - 100px)' }}>
                    <HighchartsReact
                        containerProps={{
                            style: {
                                height: 'calc(100vh - 100px)',
                            },
                        }}
                        constructorType="mapChart"
                        highcharts={Highcharts}
                        options={mapOptions}
                    />
                </div>
            ) : (
                <LoadingIcon />
            )}
        </>
    );
};

export default MapWard;

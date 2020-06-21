import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts/highmaps';
import HighchartsExporting from 'highcharts/modules/exporting';
import { useDispatch, useSelector } from 'react-redux';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import HighchartsReact from 'highcharts-react-official';
import PropTypes from 'prop-types';
import LoadingIcon from '../LoadingIcon';
import { fetchMapData } from '../../util/api/fetchMapJson';
import * as action from '../../store/map-key/actions';
import { MAP_KEY_HCM } from '../../util/constants';
import {
    CUSTOM_STYLE_HIGHMAPS,
    CUSTOM_SERIES_HIGHMAPS,
    getCustomHighmaps,
} from '../../custom/custom-map';

if (typeof Highcharts === 'object') {
    new HighchartsExporting(Highcharts);
    new HighchartsDrilldown(Highcharts);
}
const MapWard = ({ dataWard, setStage }) => {
    const [wardMap, setWardMap] = useState(null);
    const { mapKey } = useSelector((state) => state.mapKey);
    const dispatch = useDispatch();

    useEffect(() => {
        async function fetchData() {
            if (mapKey !== MAP_KEY_HCM) {
                const response = await fetchMapData(mapKey);
                setWardMap(response);
            }
        }
        fetchData();
    }, [mapKey]);

    const backToMapDistrict = async () => {
        await dispatch(action.fetchMapKey(MAP_KEY_HCM));
        setStage(0);
    };

    const mapOptions = {
        ...CUSTOM_STYLE_HIGHMAPS,
        title: {
            text: 'Bản đồ thể hiện mật độ bất động sản ',
            style: {
                color: 'white',
                fontSize: '12px',
            },
        },
        chart: getCustomHighmaps({}),
        exporting: {
            buttons: [
                {
                    text: 'Quay lại bản đồ TPHCM',
                    onclick: async () => {
                        await backToMapDistrict();
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
                name: '',
                joinBy: ['hc-key', 'hc-key'],
                ...CUSTOM_SERIES_HIGHMAPS,
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
MapWard.propTypes = {
    dataWard: PropTypes.array.isRequired,
    setStage: PropTypes.func.isRequired,
};
export default MapWard;

import React, { useRef } from 'react';
import Highcharts from 'highcharts/highmaps';
import HighchartsExporting from 'highcharts/modules/exporting';
import { useDispatch } from 'react-redux';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import HighchartsReact from 'highcharts-react-official';
import { BINDING_OPTIONS } from '../../util/bindingOptions';
import {
    CUSTOM_STYLE_HIGHMAPS,
    CUSTOM_SERIES_HIGHMAPS,
    getCustomHighmaps,
} from '../../themes/custom-map';
import * as action from '../../store/map-key/actions';

if (typeof Highcharts === 'object') {
    new HighchartsExporting(Highcharts);
    new HighchartsDrilldown(Highcharts);
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
        ...CUSTOM_STYLE_HIGHMAPS,
        title: {
            text:
                'Bản đồ thể hiện mật độ bất động sản của Thành Phố Hồ Chí Minh',
            style: {
                fontSize: '12px',
                backgroundColor: 'rgba(0,0,0,0)',
                color: '#fff',
            },
        },
        chart: getCustomHighmaps({
            drilldown: handleDrilldownMap,
        }),
        series: [
            {
                mapData,
                data: dataMap,
                name: '',
                joinBy: ['hc-key', 'hc-key'],
                ...CUSTOM_SERIES_HIGHMAPS,
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

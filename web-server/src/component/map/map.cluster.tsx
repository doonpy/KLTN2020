import React from 'react';
import Highcharts from 'highcharts/highmaps';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import { GeoJsonData } from '../../util/geo-json-data';

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HighchartsDrilldown(Highcharts);
}

const MapChart = ({ geoJson }: { geoJson: GeoJsonData }): JSX.Element => {
    const data = geoJson.features;
    geoJson.features.forEach((item) => {
        data.drilldown =
    });

    const options: Highcharts.Options = {
        title: {
            text: 'Cluster',
        },
        mapNavigation: {
            enabled: true,
        },
        series: [
            {
                type: 'map',
                mapData: geoJson,
                color: '0d233a',
            },
        ],
    };

    return <HighchartsReact highcharts={Highcharts} constructorType="mapChart" options={options} />;
};

export default MapChart;

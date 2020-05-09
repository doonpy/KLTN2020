import React from 'react';
import MapChart from '../component/map/map.cluster';
import { GeoJsonData, getGeoJsonByPath } from '../util/geo-json-data';

export async function getServerSideProps() {
    const geoJson: GeoJsonData = await getGeoJsonByPath('province/hcm.geojson');

    return { props: { geoJson } };
}

const Page = ({ geoJson }: { geoJson: GeoJsonData }): JSX.Element => {
    return <MapChart geoJson={geoJson} />;
};

export default Page;

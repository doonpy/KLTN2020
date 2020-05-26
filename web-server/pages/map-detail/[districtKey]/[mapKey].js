import React from 'react';
import { useRouter } from 'next/router';
import MapChartDetail from '../../../components/map-chart/map-chart.detail';
import request from '../../../util/api/request';

const Page = ({ mapData, rawDataset }) => {
    const router = useRouter();
    return <MapChartDetail mapData={mapData} rawDataset={rawDataset} />;
};

export async function getServerSideProps({ params }) {
    const { districtKey, mapKey } = params;
    const response = await fetch(`http://localhost:3001/geojson/hcm/ward/${districtKey}/${mapKey}.geo.json`);
    const mapData = await response.json();
    const { rawDataset } = await request.get(
        `/api/v1/vi/raw-dataset?limit=500&populate=1&address=${encodeURI('quận 1')}&address=${encodeURI('bến nghé')}`
    );
    return {
        props: { mapData, rawDataset },
    };
}

export default Page;

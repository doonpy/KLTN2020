import React from 'react';
import MapChartOverview from '../components/map-chart/map-chart.overview';

const Page = ({ mapData }) => {
    return <MapChartOverview mapData={mapData} />;
};

export async function getServerSideProps() {
    const response = await fetch(
        `http://localhost:3001/geojson/hcm/full.geo.json`
    );
    const mapData = await response.json();
    return {
        props: { mapData },
    };
}

export default Page;

import React from 'react';
import dynamic from 'next/dynamic';
import RenderCompleted from '../hooks/use-mounted';
import MapOverview from './maps/MapOverview';

const MapLeaf = dynamic(() => import('./maps/MapLeaf'), {
    ssr: false,
});

const PageMap = ({ mapCollection }) => {
    const mapData = mapCollection[0].content;
    const data = mapData.features.map((feature, index) => {
        feature.drilldown = feature.properties['hc-key'];
        feature.value = index;
        feature.code = feature.properties['osm-relation-id'];
        return feature;
    });
    const isMounted = RenderCompleted();

    return (
        <div className="flex-1 flex">
            <div className="w-7/12 border-r border-primary">
                <div className="overflow-auto w-full">{isMounted && <MapLeaf mapData={mapData} />}</div>
            </div>
            <div className="w-5/12 h-full">
                <MapOverview mapData={mapData} data={data} mapCollection={mapCollection} />
            </div>
        </div>
    );
};

export default PageMap;

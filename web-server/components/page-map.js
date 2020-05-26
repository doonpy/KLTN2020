import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import RenderCompleted from '../hooks/use-mounted';
import MapOverview from './maps/MapOverview';
import MapWard from './maps/MapWard';

const MapLeaf = dynamic(() => import('./maps/MapLeaf'), {
    ssr: false,
});

const PageMap = ({ mapStaticJSON, dataSummary }) => {
    const [stage, setStage] = useState(0);
    const mapData = mapStaticJSON[0].content;
    const isMounted = RenderCompleted();
    const dataMap = dataSummary
        .map((w) => {
            const realEstateDensity = w.summaryAmount / w.acreage;
            return {
                name: w.name,
                value: realEstateDensity,
                drilldown: w.drilldown,
                'hc-key': w.code,
            };
        })
        .filter((item) => item.value > 0);

    return (
        <div className="flex-1 flex">
            <div className="w-7/12 border-r border-primary">
                <div className="overflow-auto w-full">{isMounted && <MapLeaf mapData={mapData} />}</div>
            </div>
            <div className="w-5/12 h-full">
                {dataSummary &&
                    (stage === 0 ? (
                        <MapOverview mapData={mapData} dataMap={dataMap} setStage={(number) => setStage(number)} />
                    ) : (
                        <MapWard dataWard={dataMap} setStage={(number) => setStage(number)} />
                    ))}
            </div>
        </div>
    );
};

export default PageMap;

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import RenderCompleted from '../hooks/use-mounted';
import LoadingIcon from './LoadingIcon';
import { PROPERTY_TYPE } from '../util/constants';

const MapLeaf = dynamic(() => import('./maps/MapLeaf'), {
    ssr: false,
});
const MapOverview = dynamic(() => import('./maps/MapOverview'), {
    loading: () => <LoadingIcon />,
});
const MapWard = dynamic(() => import('./maps/MapWard'), {
    loading: () => <LoadingIcon />,
});

const PageMap = ({ mapStaticJSON, dataSummary, tabMap }) => {
    const [stage, setStage] = useState(0);
    const [propertyStatge, setProperty] = useState(12);
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
    const onClickProperty = (index) => {
        setProperty(index);
    };
    return (
        <div className="flex-1 flex relative">
            <div
                className={
                    tabMap === 0
                        ? `bottom-0 left-0 w-full  border border-solid border-light-primary dark:border-primary absolute dark:bg-gray-900 bg-white`
                        : 'hidden'
                }
                style={{ height: '35px' }}
            >
                <div className="flex items-center justify-around pt-1">
                    <div
                        className="mx-2 border-b-2 border-blue-400 py-1 cursor-pointer"
                        role="presentation"
                        style={{ fontSize: '10px' }}
                        onClick={() => onClickProperty(12)}
                    >
                        Chung
                    </div>
                    {PROPERTY_TYPE.map((w, index) => (
                        <div
                            className="mx-2 cursor-pointer"
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            style={{ fontSize: '10px' }}
                            role="presentation"
                            onClick={() => onClickProperty(index)}
                        >
                            {w[0]}
                        </div>
                    ))}
                </div>
            </div>
            {tabMap === 0 ? (
                <div className="w-full border-r border-light-primary dark:border-primary">
                    <div className="overflow-auto w-full">
                        {isMounted && <MapLeaf property={propertyStatge} />}
                    </div>
                </div>
            ) : (
                <div className="w-full h-full">
                    {dataSummary &&
                        (stage === 0 ? (
                            <MapOverview
                                mapData={mapData}
                                dataMap={dataMap}
                                setStage={(number) => setStage(number)}
                            />
                        ) : (
                            <MapWard
                                dataWard={dataMap}
                                setStage={(number) => setStage(number)}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};

export default PageMap;

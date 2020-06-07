import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import RenderCompleted from '../hooks/use-mounted';
import LoadingIcon from './LoadingIcon';
import { PROPERTY_TYPE_NUMBER, MAP_MODE } from '../util/constants';

const MapLeaf = dynamic(() => import('./maps/MapLeaf'), {
    ssr: false,
});
const MapOverview = dynamic(() => import('./maps/MapOverview'), {
    loading: () => <LoadingIcon />,
});
const MapWard = dynamic(() => import('./maps/MapWard'), {
    loading: () => <LoadingIcon />,
});

const PageMap = ({ mapStaticJSON, dataSummary, tabMap, transactionStage }) => {
    const [stage, setStage] = useState(0);
    const [propertyStage, setProperty] = useState(PROPERTY_TYPE_NUMBER[0].id);
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
                    tabMap !== MAP_MODE.DENSITY_MODE
                        ? `bottom-0 left-0 w-full  border border-solid border-light-primary dark:border-primary absolute dark:bg-gray-900 bg-white`
                        : 'hidden'
                }
                style={{ height: '40px' }}
            >
                <div className="flex items-center justify-around pt-1">
                    {PROPERTY_TYPE_NUMBER.map((property) => (
                        <div
                            className={`mx-2 py-1 cursor-pointer text-center ${
                                propertyStage === property.id
                                    ? 'font-extrabold text-blue-400'
                                    : ''
                            }`}
                            key={property.id}
                            style={{ fontSize: '9px' }}
                            role="presentation"
                            onClick={() => onClickProperty(property.id)}
                        >
                            {property.wording[0]}
                        </div>
                    ))}
                </div>
            </div>
            {tabMap !== MAP_MODE.DENSITY_MODE ? (
                <div className="w-full border-r border-light-primary dark:border-primary">
                    <div className="overflow-auto w-full">
                        {isMounted && (
                            <MapLeaf
                                tabMap={tabMap}
                                propertyStage={propertyStage}
                                transactionStage={transactionStage}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="w-full h-full relative">
                    <div
                        className="text-center absolute font-bold top-0 right-0 m-0 m-auto text-gray-400, text-xs"
                        style={{ zIndex: 9999, left: '35px', padding: '10px' }}
                    >
                        {` Bản đồ thể hiện ${tabMap} bất động sản`}
                    </div>
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

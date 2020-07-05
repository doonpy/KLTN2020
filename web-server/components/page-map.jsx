import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import RenderCompleted from '../hooks/use-mounted';
import PropertyOptionBottom from './maps/PropertyOptionBottom';
import LoadingWithTitle from './maps/LoadingWithTitle';
import { PROPERTY_TYPE_NUMBER, MAP_MODE } from '../util/constants';
/* eslint-disable react/display-name */
const MapLeaf = dynamic(() => import('./maps/MapLeaf'), {
    ssr: false,
    loading: () => <LoadingWithTitle name="Đang tải dữ liệu" />,
});
const MapOverview = dynamic(() => import('./maps/MapOverview'), {
    loading: () => <LoadingWithTitle name="Đang tải dữ liệu" />,
});
const MapWard = dynamic(() => import('./maps/MapWard'), {
    loading: () => <LoadingWithTitle name="Đang tải dữ liệu" />,
});

const PageMap = ({
    mapStaticJSON,
    dataSummary,
    transactionStage,
    setTransaction,
}) => {
    const { modeMap } = useSelector((state) => state.modeMap);
    const [stage, setStage] = useState(0);
    const [propertyStage, setProperty] = useState(PROPERTY_TYPE_NUMBER[0].id);
    const mapData = mapStaticJSON[0]?.content;
    const isMounted = new RenderCompleted();
    const dataMap = dataSummary
        ?.map((w) => {
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
        <div className="flex-1 flex relative mt-1 mx-1">
            <PropertyOptionBottom
                isDensityMode={modeMap !== MAP_MODE.DENSITY_MODE}
                onClickProperty={onClickProperty}
                propertyStage={propertyStage}
            />
            {modeMap !== MAP_MODE.DENSITY_MODE ? (
                <div className="w-full ">
                    <div className="overflow-auto w-full">
                        {isMounted && (
                            <MapLeaf
                                tabMap={modeMap}
                                propertyStage={propertyStage}
                                transactionStage={transactionStage}
                                setTransaction={setTransaction}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="w-full h-full relative">
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
PageMap.propTypes = {
    mapStaticJSON: PropTypes.arrayOf(PropTypes.any),
    dataSummary: PropTypes.arrayOf(PropTypes.object),
    transactionStage: PropTypes.number,
};
export default PageMap;

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Map, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import Control from 'react-leaflet-control';
import debounce from 'lodash.debounce';
import { useSelector, useDispatch } from 'react-redux';
import useDarkMode from 'use-dark-mode';
import { FaRegListAlt } from 'react-icons/fa';
import PropTypes from 'prop-types';
import LegendMap from './LegendMap';
import LoadingIcon from '../LoadingIcon';
import MapLeafLeftSide from './MapLeafLeftSide';
import { ZOOM_LEVEL, MAP_MODE } from '../../util/constants';
import useMapPoint from '../../hooks/use-map-point';
import * as action from '../../store/color-point/actions';
import {
    numberWithCommas,
    setRadiusByArea,
    setRadiusByPrice,
    setColorByArea,
    setColorByPrice,
} from '../../util/services/helper';

const TitleTypeMap = ({ type }) => {
    return (
        <h1
            className="text-center absolute font-bold top-0 right-0 m-0 m-auto text-gray-400, text-xs"
            style={{ zIndex: 9999, left: '35px', padding: '10px' }}
        >
            {` Bản đồ thể hiện ${type} bất động sản`}
        </h1>
    );
};

const LoadingMap = ({ isLoading }) => {
    return isLoading ? (
        <div
            className="text-center absolute font-bold top-0 right-0 m-0 m-auto text-gray-400 h-full"
            style={{ zIndex: 9999, left: '35px', padding: '10px' }}
        >
            <LoadingIcon />
        </div>
    ) : null;
};
export default function MapLeaf({ propertyStage, transactionStage }) {
    const map = useRef();

    const { value: hasActiveDarkMode } = useDarkMode();

    const { modeMap } = useSelector((state) => state.modeMap);
    const dispatch = useDispatch();
    const centerPosition = {
        lat: 10.753715262326807,
        lng: 106.7129197816087,
    };

    const [latlngBounds, setBounds] = useState({
        minLat: 10.213570791008156,
        maxLat: 11.292894361058085,
        minLng: 106.00296020507814,
        maxLng: 107.42156982421876,
    });
    const [zoomLevel, setZoomLevel] = useState(10);
    const [onLegend, setOnLegend] = useState(true);

    const area = ZOOM_LEVEL.find((w) => w.zoom === zoomLevel);
    const { data, isValidating } = useMapPoint({
        variables: {
            minAcreage: modeMap === MAP_MODE.AREA_MODE ? area.minArea : 1,
            minPrice: modeMap === MAP_MODE.PRICE_MODE ? area.minPrice : 1,
            minLat: latlngBounds.minLat,
            maxLat: latlngBounds.maxLat,
            minLng: latlngBounds.minLng,
            maxLng: latlngBounds.maxLng,
            propertyType: propertyStage,
            transactionType: transactionStage,
        },
    });

    const onMove = debounce((event) => {
        const bound = event.target.getBounds();
        setBounds({
            minLat: bound._southWest.lat,
            maxLat: bound._northEast.lat,
            minLng: bound._southWest.lng,
            maxLng: bound._northEast.lng,
        });
        setZoomLevel(event.target.getZoom());
    }, 500);

    const resetState = () => {
        setZoomLevel(10);
    };
    return (
        <div className="relative" style={{ height: 'calc(100vh - 135px)' }}>
            <TitleTypeMap type={modeMap} />
            <LoadingMap isLoading={!data && isValidating} />
            <Map
                ref={map}
                onmoveend={onMove}
                center={[centerPosition.lat, centerPosition.lng]}
                zoom={zoomLevel}
                doubleClickZoom={false}
                attributionControl={false}
                minZoom={10}
                scrollWheelZoom
                style={{
                    color: 'white',
                    height: '100%',
                }}
            >
                <Control>
                    {onLegend ? (
                        <LegendMap
                            zoomLevel={zoomLevel}
                            typeLegend={modeMap}
                            setOnLegend={setOnLegend}
                        />
                    ) : null}
                </Control>
                <MapLeafLeftSide resetState={resetState} />
                <Control position="bottomright">
                    <FaRegListAlt
                        size={24}
                        className="cursor-pointer text-gray-400 relative"
                        onClick={() => setOnLegend(!onLegend)}
                        style={{ zIndex: 99999 }}
                    />
                </Control>

                {!hasActiveDarkMode ? (
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                ) : (
                    <TileLayer
                        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                    />
                )}

                {data?.mapPoints &&
                    data.mapPoints?.map((c) => {
                        return c.points.map((point) => {
                            return (
                                <CircleMarker
                                    onMouseOver={(e) => {
                                        const { color } = e.target.options;
                                        dispatch(action.getColorPoint(color));
                                    }}
                                    onFocus={(e) => {
                                        const { color } = e.target.options;
                                        dispatch(action.getColorPoint(color));
                                    }}
                                    onMouseOut={() => {
                                        dispatch(action.getColorPoint(''));
                                    }}
                                    onBlur={() => {
                                        dispatch(action.getColorPoint(''));
                                    }}
                                    color={
                                        modeMap === MAP_MODE.AREA_MODE
                                            ? setColorByArea(
                                                  point.rawDataset[0].acreage
                                              )
                                            : setColorByPrice(
                                                  point.rawDataset[0].price /
                                                      1000000000
                                              )
                                    }
                                    key={point.rawDataset[0].rawDataId}
                                    fillOpacity={1}
                                    stroke={false}
                                    center={[c.lat, c.lng]}
                                    radius={
                                        modeMap === MAP_MODE.AREA_MODE
                                            ? setRadiusByArea(
                                                  point.rawDataset[0].acreage
                                              )
                                            : setRadiusByPrice(
                                                  point.rawDataset[0].price /
                                                      1000000000
                                              )
                                    }
                                >
                                    <Tooltip>{`Ấn để xem ${modeMap}`}</Tooltip>
                                    <Popup closeButton>
                                        <div className="flex flex-col cursor-pointer">
                                            {/* <div></div> */}
                                            <div
                                                className="overflow-auto h-full w-full"
                                                style={{ maxHeight: '100px' }}
                                            >
                                                {point.rawDataset.map(
                                                    (rawdata) => {
                                                        return (
                                                            <div
                                                                key={
                                                                    rawdata.rawDataId
                                                                }
                                                            >
                                                                <Link
                                                                    href="/detail/[id]"
                                                                    as={`/detail/${rawdata.rawDataId}`}
                                                                >
                                                                    <ul className="list-inside list-disc">
                                                                        {modeMap ===
                                                                        MAP_MODE.AREA_MODE ? (
                                                                            <li className="text-blue-400 py-2 hover:text-blue-600">
                                                                                {`Diện tích: ${numberWithCommas(
                                                                                    rawdata.acreage
                                                                                )} m2 `}
                                                                            </li>
                                                                        ) : (
                                                                            <li className="text-blue-400 py-2">
                                                                                {`Giá: ${numberWithCommas(
                                                                                    rawdata.price
                                                                                )} ${
                                                                                    rawdata.currency
                                                                                } `}
                                                                            </li>
                                                                        )}
                                                                    </ul>
                                                                </Link>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            );
                        });
                    })}
            </Map>
        </div>
    );
}
TitleTypeMap.propTypes = {
    type: PropTypes.string.isRequired,
};
LoadingMap.propTypes = {
    isLoading: PropTypes.bool.isRequired,
};
MapLeaf.propTypes = {
    transactionStage: PropTypes.number,
    propertyStage: PropTypes.number,
};

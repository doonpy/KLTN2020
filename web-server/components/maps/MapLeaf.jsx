import React, { useEffect, useState, useRef } from 'react';
import { Map, TileLayer, Tooltip, CircleMarker } from 'react-leaflet';
import Router from 'next/router';
import debounce from 'lodash.debounce';
import useDarkMode from 'use-dark-mode';
import LegendLeaf from './LegendLeaf';
import { ACREAGE_BY_ZOOM_LEVEL, MAP_MODE } from '../../util/constants';
import useMapPoint from '../../hooks/use-map-point';

export default function MapLeaf({ propertyStage, transactionStage, tabMap }) {
    const { value: hasActiveDarkMode } = useDarkMode();
    const map = useRef();
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

    const area = ACREAGE_BY_ZOOM_LEVEL.find((w) => w.zoom === zoomLevel);
    const { data, isValidating } = useMapPoint({
        variables: {
            minAcreage: tabMap === MAP_MODE.AREA_MODE ? area.minArea : 1,
            minPrice: tabMap === MAP_MODE.PRICE_MODE ? area.minPrice : 1,
            minLat: latlngBounds.minLat,
            maxLat: latlngBounds.maxLat,
            minLng: latlngBounds.minLng,
            maxLng: latlngBounds.maxLng,
            propertyType: propertyStage,
            transactionType: transactionStage,
        },
    });

    // console.log(data);
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

    return (
        <div className="relative" style={{ height: 'calc(100vh - 135px)' }}>
            <Map
                ref={map}
                onmoveend={onMove}
                center={[centerPosition.lat, centerPosition.lng]}
                zoom={zoomLevel}
                doubleClickZoom={false}
                attributionControl={false}
                minZoom={10}
                scrollWheelZoom={false}
                style={{
                    color: 'white',
                    height: '100%',
                }}
            >
                {!hasActiveDarkMode ? (
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                ) : (
                    <TileLayer
                        attribution='&amp;&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                )}

                {data?.mapPoints &&
                    data.mapPoints.map((c) => {
                        return c.points.map((point, index) => {
                            return (
                                <CircleMarker
                                    color={
                                        tabMap === MAP_MODE.AREA_MODE
                                            ? 'red'
                                            : 'blue'
                                    }
                                    key={index}
                                    fillOpacity={0.8}
                                    stroke={false}
                                    center={[c.lat, c.lng]}
                                    radius={
                                        Math.sqrt(
                                            point.rawDataset[0].acreage /
                                                Math.PI
                                        ) / 20
                                    }
                                >
                                    <Tooltip>
                                        <div className="flex flex-col">
                                            {point.rawDataset.map((a) => {
                                                return (
                                                    <span key={a.rawDataId}>
                                                        {`Diện tích: ${a.acreage} m2 + ${a.rawDataId} + `}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                        <div className="text-blue-800 underline">
                                            Ân để xem chi tiết
                                        </div>
                                    </Tooltip>
                                </CircleMarker>
                            );
                        });
                    })}

                {/* <LegendLeaf /> */}
            </Map>
        </div>
    );
}

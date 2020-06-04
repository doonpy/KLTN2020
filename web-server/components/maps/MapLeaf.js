import React, { useEffect, useState, useRef } from 'react';
import { Map, TileLayer, Tooltip, CircleMarker } from 'react-leaflet';
import Router from 'next/router';
import debounce from 'lodash.debounce';
import LegendLeaf from './LegendLeaf';
import { ACREAGE_BY_ZOOM_LEVEL } from '../../util/constants';
import useMapPoint from '../../hooks/use-map-point';

export default function MapLeaf({ propertyStage, transactionStage }) {
    // const darkMode = localStorage.getItem('darkMode');
    const centerPosition = {
        lat: 10.753715262326807,
        lng: 106.7129197816087,
    };
    const map = useRef();
    const [latlngBounds, setBounds] = useState({
        minLat: 10.213570791008156,
        maxLat: 11.292894361058085,
        minLng: 106.00296020507814,
        maxLng: 107.42156982421876,
    });

    const [zoomLevel, setZoomLevel] = useState(10);
    const [dataMap, setDataMap] = useState({ zoom: zoomLevel, data: [] });
    const area = ACREAGE_BY_ZOOM_LEVEL.find((w) => w.zoom === zoomLevel);
    const { data, isValidating } = useMapPoint({
        variables: {
            minAcreage: area.minArea,
            maxAcreage: area.maxArea,
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

    useEffect(() => {
        setDataMap({
            zoomLevel,
            data: data?.mapPoints,
        });
    }, [data]);

    const routerToDetail = (id) => {
        Router.push(`/detail/${id}`);
    };

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
                {/* <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                /> */}
                <TileLayer
                    attribution='&amp;&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {dataMap?.data &&
                    dataMap.data.map((c, index) => {
                        return (
                            <CircleMarker
                                color="red"
                                // eslint-disable-next-line react/no-array-index-key
                                key={index}
                                fillOpacity={0.8}
                                radius={4}
                                // stroke={false}
                                center={[c.lat, c.lng]}
                                // onclick={() => {
                                //     routerToDetail(item.rawDataId);
                                // }}
                                // radius={
                                //     Math.sqrt(
                                //         c.points[0].rawDataset[0].acreage /
                                //             Math.PI
                                //     ) / 20
                                // }
                            >
                                <Tooltip>
                                    {/* <span>{`Diện tích: ${item.acreage} m2`}</span> */}
                                    <div className="text-blue-800 underline">
                                        Ân để xem chi tiết
                                    </div>
                                </Tooltip>
                            </CircleMarker>
                        );
                    })}

                {/* <LegendLeaf /> */}
            </Map>
        </div>
    );
}

import React, { useEffect, useState, useRef } from 'react';
import {
    Map,
    TileLayer,
    Tooltip,
    CircleMarker,
    Marker,
    GeoJSON,
} from 'react-leaflet';
import Router from 'next/router';
import debounce from 'lodash.debounce';
import LegendLeaf from './LegendLeaf';
import { ACREAGE_BY_ZOOM_LEVEL } from '../../util/constants';
import useMapPoint from '../../hooks/use-map-point';

export default function MapLeaf({ mapData, property }) {
    const map = useRef();
    const setColorByArea = (area) => {
        if (area >= 50000) {
            return 'red';
        }
        if (area >= 5000 && area < 49999) {
            return '#3388ff';
        }
        if (area >= 1000 && area < 5000) {
            return 'green';
        }
        if (area >= 800 && area < 1000) {
            return 'white';
        }
        return 'white';
    };
    const [state, setState] = useState({
        center: {
            lat: 10.753715262326807,
            lng: 106.7129197816087,
        },
    });
    const [latlngBounds, setBounds] = useState({
        minLat: 10.213570791008156,
        maxLat: 11.292894361058085,
        minLng: 106.00296020507814,
        maxLng: 107.42156982421876,
    });

    const [zoomLevel, setZoomLevel] = useState(10);
    const [dataMap, setDataMap] = useState({ zoom: zoomLevel, data: [] });
    const [dataChild, setDataChild] = useState([]);

    const area = ACREAGE_BY_ZOOM_LEVEL.find((w) => w.zoom === zoomLevel);

    const position = [state.center.lat, state.center.lng];
    const { data } = useMapPoint({
        variables: {
            minAcreage: area.minArea,
            maxAcreage: area.maxArea,
            minLat: latlngBounds.minLat,
            maxLat: latlngBounds.maxLat,
            minLng: latlngBounds.minLng,
            maxLng: latlngBounds.maxLng,
            propertyType: property,
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
        // console.log(event.target.getZoom());
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
                // onmoveend={onMove}
                center={position}
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
                    dataMap.data.map(({ points, lat, lng }) => {
                        return points.map(({ rawDataset }) => {
                            return rawDataset.map(
                                ({ rawDataId, acreage }, index) => {
                                    return (
                                        <CircleMarker
                                            color={setColorByArea(acreage)}
                                            // eslint-disable-next-line react/no-array-index-key
                                            key={index}
                                            fillOpacity={0.5}
                                            // stroke={false}
                                            center={[lat, lng]}
                                            onclick={() => {
                                                routerToDetail(rawDataId);
                                            }}
                                            radius={
                                                Math.sqrt(acreage / Math.PI) /
                                                20
                                            }
                                        >
                                            <Tooltip>
                                                <span>{`Diện tích: ${acreage} m2`}</span>
                                                <div className="text-blue-800 underline">
                                                    Ân để xem chi tiết
                                                </div>
                                            </Tooltip>
                                        </CircleMarker>
                                    );
                                }
                            );
                        });
                    })}

                <LegendLeaf />
                {/* <GeoJSON data={mapData} style={{ fillColor: 'rgba(0,0,0,0)', weight: 0.5 }} /> */}
            </Map>
        </div>
    );
}

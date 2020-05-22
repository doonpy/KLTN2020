/* eslint-disable react/state-in-constructor */
import React, { useState } from 'react';
import { Map, TileLayer, GeoJSON, Marker } from 'react-leaflet';

export default function MapLeaf({ mapData }) {
    const [state, setState] = useState({
        center: {
            lat: 10.753715262326807,
            lng: 106.7129197816087,
        },

        zoom: 10,
    });
    const position = [state.center.lat, state.center.lng];
    const onMove = (event) => {
        // console.log(event.target.getCenter());
        // console.log(event.target._zoom);
        // console.log(event.target.getBounds());
        // console.log(state.zoom);
    };
    return (
        <div style={{ height: 'calc(100vh - 100px)' }}>
            <Map
                onmoveend={onMove}
                center={position}
                zoom={state.zoom}
                attributionControl={false}
                minZoom={10}
                scrollWheelZoom={false}
                style={{
                    color: 'white',
                    height: '100%',
                }}
            >
                {/* <Marker position={[10.8230969, 106.5946442]} draggable /> */}
                <TileLayer
                    attribution='&amp;&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                /> */}
                <GeoJSON data={mapData} style={{ fillColor: 'rgba(0,0,0,0)', weight: 1, color: 'red' }} />
            </Map>
        </div>
    );
}

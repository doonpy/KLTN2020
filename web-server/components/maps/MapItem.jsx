import React from 'react';
import { Map, TileLayer, Marker } from 'react-leaflet';

const MapItem = ({ position }) => {
    return (
        <Map
            center={position}
            zoom={13}
            doubleClickZoom={false}
            attributionControl={false}
            minZoom={10}
            scrollWheelZoom={false}
            style={{
                color: 'white',
                height: '500px',
            }}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <Marker position={position} />
        </Map>
    );
};

export default MapItem;

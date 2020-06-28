import React from 'react';
import PropTypes from 'prop-types';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';

const MapItem = ({ position }) => {
    const url = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${process.env.MAP_BOX_KEY}`;
    return (
        <Map
            center={position}
            zoom={15}
            doubleClickZoom={false}
            attributionControl={false}
            minZoom={10}
            style={{
                color: 'white',
                height: '500px',
            }}
        >
            <TileLayer
                url={url}
                id="mapbox/streets-v11"
                attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
            />

            <Marker position={position}>
                <Popup>
                    <b>Vị trí của bất động sản</b>
                </Popup>
            </Marker>
        </Map>
    );
};
MapItem.propTypes = {
    position: PropTypes.array,
};
export default MapItem;

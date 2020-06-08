import { useEffect } from 'react';
import { useLeaflet } from 'react-leaflet';
import L from 'leaflet';

const MapLoading = () => {
    const { map } = useLeaflet();
    useEffect(() => {
        const loader = L.control({ position: 'center' });
    });
    return null;
};

export default MapLoading;

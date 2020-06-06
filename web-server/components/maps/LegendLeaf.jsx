/* eslint-disable no-nested-ternary */
import { useLeaflet } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

const LegendLeaf = () => {
    const { map } = useLeaflet();

    useEffect(() => {
        // get color depending on population density value
        const getColor = (d) => {
            return d > 50000
                ? 'red'
                : d > 5000
                ? '#3388ff'
                : d > 1000
                ? 'green'
                : d > 100
                ? 'white'
                : d > 0;
        };

        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'info legend');
            const grades = [1000, 5000, 50000];
            const labels = [];
            let from;
            let to;

            for (let i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];
                labels.push(
                    `<i style="background:${getColor(from + 1)}"/> ${from}${
                        to ? `&ndash;${to} m<sup>2</sup>` : ' m<sup>2</sup> +'
                    }`
                );
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };

        legend.addTo(map);
    }, [map]);
    return null;
};

export default LegendLeaf;

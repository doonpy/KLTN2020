import axios from 'axios';

export interface GeoJsonData {
    type: string;
    features: {
        type: string;
        properties: {
            'osm-relation-id': string;
            name: string;
        };
        geometry: {
            type: string;
            coordinates: [];
        };
    }[];
}

/**
 * @param {string} path
 *
 * @return {GeoJsonData}
 */
export const getGeoJsonByPath = async (path: string): Promise<GeoJsonData> => {
    const { data }: { data: GeoJsonData } = await axios.get(`http://localhost:3001/static/geojson/${path}`);

    return data;
};

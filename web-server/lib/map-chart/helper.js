/**
 * @param {string} mapKey
 * @return {Promise<any>}
 */
export const fetchMapData = async (mapKey) => {
    const response = await fetch(`http://localhost:3001/geojson/${mapKey}.geo.json`);
    return response.json();
};

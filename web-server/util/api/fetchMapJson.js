/**
 * @param {string} mapKey
 * @return {Promise<any>}
 */
export const fetchMapData = async (mapKey) => {
    const response = await fetch(`/hcm/${mapKey}.geo.json`);
    return response.json();
};

/**
 * @param {string} mapKey
 * @return {Promise<any>}
 */
export const fetchMapData = async (mapKey) => {
    const response = await fetch(
        `${process.env.WEB_URI}/hcm/${mapKey}.geo.json`
    );
    return response.json();
};

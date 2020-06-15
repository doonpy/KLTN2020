export const GET_MODE_MAP = 'GET_MODE_MAP';

/**
 *
 * @param {string} modeMap Map mode includes location area and price
 * @return {object} output
 * @return {string} output.type
 * @return {string} output.modeMap
 */

export const getMapMode = (modeMap) =>
    Object({
        type: GET_MODE_MAP,
        modeMap,
    });

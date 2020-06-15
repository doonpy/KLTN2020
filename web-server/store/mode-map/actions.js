export const GET_MODE_MAP = 'GET_MODE_MAP';

export const getMapMode = (modeMap) =>
    Object({
        type: GET_MODE_MAP,
        modeMap,
    });

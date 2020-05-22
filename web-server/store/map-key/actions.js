export const GET_MAP_KEY = 'GET_MAP_KEY';

export const fetchMapKey = (mapKey) => {
    return {
        type: GET_MAP_KEY,
        mapKey,
    };
};

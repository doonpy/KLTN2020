export const GET_COLOR_POINT = 'GET_COLOR_POINT';

export const getColorPoint = (colorPoint) => {
    return {
        type: GET_COLOR_POINT,
        colorPoint,
    };
};

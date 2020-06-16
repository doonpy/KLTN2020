import { GET_COLOR_POINT } from './actions';

const initialState = {
    colorPoint: '',
};
/**
 *
 * @param {object} state
 * @param {string} colorPoint
 */
export const colorPointReducer = (
    state = initialState,
    { type, colorPoint } = {}
) => {
    switch (type) {
        case GET_COLOR_POINT:
            return {
                ...state,
                colorPoint,
            };
        default:
            return state;
    }
};

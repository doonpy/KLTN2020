import { GET_MAP_KEY } from './actions';

const inititalState = {
    mapKey: 'full',
};

export const mapKeyReducer = (state = inititalState, action) => {
    switch (action.type) {
        case GET_MAP_KEY:
            return {
                ...state,
                mapKey: action.mapKey,
            };
        default:
            return state;
    }
};

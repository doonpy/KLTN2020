import { GET_MAP_KEY } from './actions';

const initialState = {
    mapKey: 'full',
};

export const mapKeyReducer = (state = initialState, action) => {
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

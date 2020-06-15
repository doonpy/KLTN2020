import { GET_MAP_KEY } from './actions';
import { MAP_KEY_HCM } from '../../util/constants';

const initialState = {
    mapKey: MAP_KEY_HCM,
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

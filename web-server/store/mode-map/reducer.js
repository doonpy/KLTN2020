import { GET_MODE_MAP } from './actions';
import { MAP_MODE } from '../../util/constants';

const initialState = {
    modeMap: MAP_MODE.AREA_MODE,
};

export const modeMapReducer = (
    state = initialState,
    { type, modeMap } = {}
) => {
    switch (type) {
        case GET_MODE_MAP:
            return {
                modeMap,
            };
        default:
            return state;
    }
};

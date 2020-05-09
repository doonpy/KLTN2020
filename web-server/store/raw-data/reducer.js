import { GET_RAW_DATA, GET_RAW_ERROR, LOADING_RAW_DATA } from './actions';

const initialState = {
    loading: false,
    rawDatas: null,
    error: false,
};
export const rawDataReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOADING_RAW_DATA:
            return {
                ...state,
                loading: true,
                error: false,
            };
        case GET_RAW_DATA: {
            return {
                ...state,
                hosts: action.rawDatas,
                loading: false,
            };
        }
        default:
            return state;
    }
};

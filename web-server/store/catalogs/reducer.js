import {
    GET_CATALOG_DATA,
    LOADING_CATALOG_DATA,
    GET_CATALOG_ERROR,
} from './actions';

const initialState = {
    loading: false,
    hosts: null,
    error: false,
};
export const catalogReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOADING_CATALOG_DATA:
            return {
                ...state,
                loading: true,
                error: false,
            };
        case GET_CATALOG_DATA: {
            return {
                ...state,
                catalogs: action.catalogs,
                loading: false,
            };
        }
        default:
            return state;
    }
};

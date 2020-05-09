import { GET_GROUP_DATA_ERROR, GET_GROUP_DATA, LOADING_GROUP_DATA } from './actions';

const initialState = {
    loading: false,
    hosts: null,
    error: false,
};
export const groupedReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOADING_GROUP_DATA:
            return {
                ...state,
                loading: true,
                error: false,
            };
        case GET_GROUP_DATA: {
            return {
                ...state,
                catalogs: action.groupedDatas,
                loading: false,
            };
        }
        default:
            return state;
    }
};

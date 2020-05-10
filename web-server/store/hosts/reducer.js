import { GET_HOST_DATA, LOADING_HOST, GET_HOST_ERROR } from './actions';

const initialState = {
    loading: false,
    hosts: null,
    error: false,
};
export const hostReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOADING_HOST:
            return {
                ...state,
                loading: true,
                error: false,
            };
        case GET_HOST_DATA: {
            return {
                ...state,
                hosts: action.hosts,
                loading: false,
            };
        }
        default:
            return state;
    }
};

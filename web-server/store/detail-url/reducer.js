import { GET_DETAIL_ERROR, GET_DETAIL_URLS, LOADING_DETAIL_URL } from './actions';

const initialState = {
    loading: false,
    hosts: null,
    error: false,
};
export const detailUrlReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOADING_DETAIL_URL:
            return {
                ...state,
                loading: true,
                error: false,
            };
        case GET_DETAIL_URLS: {
            return {
                ...state,
                hosts: action.detailUrls,
                loading: false,
            };
        }
        default:
            return state;
    }
};

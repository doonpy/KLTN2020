import { GET_TOTAL_DOCUMENT, LOADING_TOTAL_DOCUMENT } from './actions';

const initialState = {
    total: null,
    fetching: false,
    error: false,
};

export const catalogReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOADING_TOTAL_DOCUMENT:
            return {
                ...state,
                loading: true,
                error: false,
            };
        case GET_TOTAL_DOCUMENT: {
            return {
                ...state,
                total: action.total,
                loading: false,
            };
        }
        default:
            return state;
    }
};

import {
    GET_PATTERNS,
    GET_PATTERNS_ERROR,
    LOADING_GET_PATTERNS,
} from './actions';

const initialState = {
    loading: false,
    hosts: null,
    error: false,
};
export const patternReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOADING_GET_PATTERNS:
            return {
                ...state,
                loading: true,
                error: false,
            };
        case GET_PATTERNS: {
            return {
                ...state,
                hosts: action.patterns,
                loading: false,
            };
        }
        default:
            return state;
    }
};

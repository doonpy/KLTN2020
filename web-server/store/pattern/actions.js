import request from '../../util/api/request';

export const GET_PATTERNS = 'GET_PATTERNS';
export const LOADING_GET_PATTERNS = 'LOADING_GET_PATTERNS';
export const GET_PATTERNS_ERROR = 'GET_PATTERNS_ERROR';

export const fetchPatternSuccess = (patterns) => {
    return {
        type: GET_PATTERNS,
        patterns,
    };
};
export const getPatternsRequest = () => {
    return async (dispatch) => {
        dispatch({
            type: LOADING_GET_PATTERNS,
        });
        try {
            const res = await request.get('/api/v1/vi/patterns');
            if (res) {
                const data = await res.json();
                dispatch(fetchPatternSuccess(data));
            }
        } catch (error) {
            dispatch({
                type: GET_PATTERNS_ERROR,
                error: error.message || 'Unexpected Error!!!',
            });
        }
    };
};

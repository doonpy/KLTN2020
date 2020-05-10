import request from '../../util/api/request';

export const GET_DETAIL_URLS = 'GET_DETAIL_URLS';
export const LOADING_DETAIL_URL = 'LOADING_DETAIL_URL';
export const GET_DETAIL_ERROR = 'GET_DETAIL_ERROR';

export const fetchDetailUrls = (detailUrls) => {
    return {
        type: GET_DETAIL_URLS,
        detailUrls,
    };
};
export const getPatternsRequest = () => {
    return async (dispatch) => {
        dispatch({
            type: LOADING_DETAIL_URL,
        });
        try {
            const res = await request.get('/api/v1/vi/detail-urls');
            if (res) {
                const data = await res.json();
                dispatch(fetchDetailUrls(data));
            }
        } catch (error) {
            dispatch({
                type: GET_DETAIL_ERROR,
                error: error.message || 'Unexpected Error!!!',
            });
        }
    };
};

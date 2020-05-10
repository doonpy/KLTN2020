import request from '../../util/api/request';

export const GET_HOST_DATA = 'GET_HOST';
export const LOADING_HOST = 'LOADING_HOST';
export const GET_HOST_ERROR = 'GET_HOST_ERROR';

export const fetchHostSuccess = (hosts) => {
    return {
        type: GET_HOST_DATA,
        hosts,
    };
};
export const getHostsRequest = () => {
    return async (dispatch) => {
        dispatch({
            type: LOADING_HOST,
        });
        try {
            const res = await request.get('/api/v1/vi/hosts');
            if (res) {
                const data = await res.json();
                dispatch(fetchHostSuccess(data));
            }
        } catch (error) {
            dispatch({
                type: GET_HOST_ERROR,
                error: error.message || 'Unexpected Error!!!',
            });
        }
    };
};

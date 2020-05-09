import request from '../../util/api/request';

export const GET_RAW_DATA = 'GET_RAW_DATA';
export const LOADING_RAW_DATA = 'LOADING_RAW_DATA';
export const GET_RAW_ERROR = 'GET_RAW_ERROR';

export const fetchRawDataSuccess = (rawDatas) => {
    return {
        type: GET_RAW_DATA,
        rawDatas,
    };
};

export const getRawRequest = () => {
    return async (dispatch) => {
        dispatch({
            type: LOADING_RAW_DATA,
        });
        try {
            const res = await request.get('/api/v1/vi/raw-dataset');
            if (res) {
                const data = await res.json();
                dispatch(fetchRawDataSuccess(data));
            }
        } catch (error) {
            dispatch({
                type: GET_RAW_ERROR,
                error: error.message || 'Unexpected Error!!!',
            });
        }
    };
};

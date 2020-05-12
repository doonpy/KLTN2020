import request from '../../util/api/request';

export const GET_TOTAL_DOCUMENT = 'GET_TOTAL_DOCUMENT';
export const LOADING_TOTAL_DOCUMENT = 'LOADING_TOTAL_DOCUMENT';

export const fetchTotalSuccess = (total) => {
    return {
        type: GET_TOTAL_DOCUMENT,
        total,
    };
};

export const getTotalRequest = (type) => {
    return async (dispatch) => {
        dispatch({
            type: LOADING_TOTAL_DOCUMENT,
        });
        try {
            const res = await request.get(`/api/v1/vi/${type}/count-document`);
            if (res) {
                const data = await res.json();
                dispatch(fetchTotalSuccess(data));
            }
        } catch (error) {
            console.log(error.message);
        }
    };
};

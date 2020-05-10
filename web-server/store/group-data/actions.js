import request from '../../util/api/request';

export const GET_GROUP_DATA = 'GET_GROUP_DATA';
export const LOADING_GROUP_DATA = 'LOADING_GROUP_DATA';
export const GET_GROUP_DATA_ERROR = 'GET_GROUP_DATA_ERROR';

export const fetchGroupDataSuccess = (groupedDatas) => {
    return {
        type: GET_GROUP_DATA,
        groupedDatas,
    };
};
export const getGroupedDataRequest = () => {
    return async (dispatch) => {
        dispatch({
            type: LOADING_GROUP_DATA,
        });
        try {
            const res = await request.get('/api/v1/vi/grouped-dataset');
            if (res) {
                const data = await res.json();
                dispatch(fetchGroupDataSuccess(data));
            }
        } catch (error) {
            dispatch({
                type: GET_GROUP_DATA_ERROR,
                error: error.message || 'Unexpected Error!!!',
            });
        }
    };
};

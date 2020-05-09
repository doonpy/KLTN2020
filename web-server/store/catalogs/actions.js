import request from '../../util/api/request';

export const GET_CATALOG_DATA = 'GET_CATALOG_DATA';
export const LOADING_CATALOG_DATA = 'LOADING_CATALOG_DATA';
export const GET_CATALOG_ERROR = 'GET_CATALOG_ERROR';

export const fetchCatalogSuccess = (catalogs) => {
    return {
        type: GET_CATALOG_DATA,
        catalogs,
    };
};
export const getCatalogsRequest = () => {
    return async (dispatch) => {
        dispatch({
            type: LOADING_CATALOG_DATA,
        });
        try {
            const res = await request.get('/api/v1/vi/catalogs');
            if (res) {
                const data = await res.json();
                dispatch(fetchCatalogSuccess(data));
            }
        } catch (error) {
            dispatch({
                type: GET_CATALOG_ERROR,
                error: error.message || 'Unexpected Error!!!',
            });
        }
    };
};

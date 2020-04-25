import axios from 'axios';
import { ActionCreator, AnyAction, Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { Host, GET_HOST_DATA, LOADING_HOST_DATA, ERROR_HOST_DATA, HostState } from './types';

// eslint-disable-next-line import/prefer-default-export
export const getHosts = (hosts: Host) => {
    return {
        type: GET_HOST_DATA,
        hosts,
    };
};
export const getHostsRequest = (): ThunkAction<void, HostState, unknown, AnyAction> => async dispatch => {
    dispatch({
        type: LOADING_HOST_DATA,
    });
    return axios
        .get('https://pk2020.tk/api/v1/patterns')
        .then((res: { data: { hosts: Host } }) => {
            // console.log(res.data.hosts)
            dispatch(getHosts(res.data.hosts));
        })
        .catch((error: { message: any }) => {
            dispatch({ type: ERROR_HOST_DATA, error: error.message || 'Unexpected Error!!!' });
        });
};

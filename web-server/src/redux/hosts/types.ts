export interface Host {
    name: string;
    domain: string;
    createAt: Date;
    updateAt: Date;
}
export interface HostState {
    loading: boolean;
    hosts: Host[];
    error: boolean;
}

// types
export const GET_HOST_DATA = 'GET_HOST_DATA';
export const LOADING_HOST_DATA = 'LOADING_HOST_DATA';
export const ERROR_HOST_DATA = 'ERROR_HOST_DATA';
export const ADD_HOST = 'ADD_HOST';
export const DELETE_HOST = 'DELETE_HOST';
export const UPDATE_HOST = 'UPDATE_HOST';

// eslint-disable-next-line @typescript-eslint/class-name-casing
interface getHostAction {
    type: typeof GET_HOST_DATA;
    payload: Host;
}

export type HostActionTypes = getHostAction;

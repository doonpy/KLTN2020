import { HostState, GET_HOST_DATA, HostActionTypes } from './types';

const initialState: HostState = {
    loading: false,
    hosts: [],
    error: false,
};
export function hostReducer(state = initialState, action: HostActionTypes): HostState {
    switch (action.type) {
        case GET_HOST_DATA: {
            return {
                ...state,
                ...action.payload,
            };
        }
        default:
            return state;
    }
}

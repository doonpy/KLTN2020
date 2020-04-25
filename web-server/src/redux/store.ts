import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { hostReducer } from './hosts/reducers';

export const rootReducer = combineReducers({
    hosts: hostReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

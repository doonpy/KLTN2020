/* eslint-disable import/no-extraneous-dependencies */
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { MakeStore, createWrapper, Context } from 'next-redux-wrapper';
import logger from 'redux-logger';
import { mapKeyReducer } from './map-key/reducers';

export const rootReducer = combineReducers({
    mapKey: mapKeyReducer,
});

const makeStore = () => {
    const store = createStore(
        rootReducer,
        composeWithDevTools(applyMiddleware(thunkMiddleware))
    );
    return store;
};

export const wrapper = createWrapper(makeStore, { debug: false });

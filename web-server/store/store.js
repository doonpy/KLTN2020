/* eslint-disable import/no-extraneous-dependencies */
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { MakeStore, createWrapper, Context } from 'next-redux-wrapper';
import logger from 'redux-logger';
import { countDocumentReducer } from './count-document/reducers';

export const rootReducer = combineReducers({
    countDocuments: countDocumentReducer,
});

const makeStore = () => {
    const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunkMiddleware, logger)));
    return store;
};

export const wrapper = createWrapper(makeStore);

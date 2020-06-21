import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createWrapper } from 'next-redux-wrapper';
import logger from 'redux-logger';
import { mapKeyReducer } from './map-key/reducers';
import { modeMapReducer } from './mode-map/reducer';
import { colorPointReducer } from './color-point/reducer';

export const rootReducer = combineReducers({
    mapKey: mapKeyReducer,
    modeMap: modeMapReducer,
    colorPoint: colorPointReducer,
});

const makeStore = () => {
    const store = createStore(
        rootReducer,
        composeWithDevTools(applyMiddleware(thunkMiddleware, logger))
    );
    return store;
};

export const wrapper = createWrapper(makeStore, { debug: false });

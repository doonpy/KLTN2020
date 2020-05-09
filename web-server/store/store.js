/* eslint-disable import/no-extraneous-dependencies */
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import logger from 'redux-logger';
import { hostReducer } from './hosts/reducer';
import { catalogReducer } from './catalogs/reducer';
import { rawDataReducer } from './raw-data/reducer';
import { groupedReducer } from './group-data/reducer';
import { patternReducer } from './pattern/reducer';
import { detailUrlReducer } from './detail-url/reducer';

export const rootReducer = combineReducers({
    hosts: hostReducer,
    catalogs: catalogReducer,
    rawDatas: rawDataReducer,
    groupedDatas: groupedReducer,
    patterns: patternReducer,
    detailUrls: detailUrlReducer,
});
const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunkMiddleware, logger)));
export default store;

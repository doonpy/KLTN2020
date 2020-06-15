import React from 'react';
import {
    FaMapMarkedAlt,
    FaMap,
    FaHandHoldingUsd,
    FaChartArea,
} from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import * as action from '../store/mode-map/actions';
import { MAP_MODE } from '../util/constants';

const PageLeft = () => {
    const dispatch = useDispatch();
    const { modeMap } = useSelector((state) => state.modeMap);

    return (
        <div
            className="dark:bg-gray-900 bg-white border-r border-solid border-light-primary dark:border-primary flex items-center flex-col pt-10"
            style={{ width: '64px' }}
        >
            <FaMapMarkedAlt
                className={`mt-8 cursor-pointer shadow-sm ${
                    modeMap !== MAP_MODE.DENSITY_MODE ? 'text-blue-600' : ''
                }`}
                size={24}
                onClick={() => dispatch(action.getMapMode(MAP_MODE.AREA_MODE))}
            />
            <FaMap
                size={24}
                className={`mt-8 cursor-pointer shadow-sm ${
                    modeMap === MAP_MODE.DENSITY_MODE ? 'text-blue-600' : ''
                }`}
                onClick={() =>
                    dispatch(action.getMapMode(MAP_MODE.DENSITY_MODE))
                }
            />
        </div>
    );
};

export default PageLeft;

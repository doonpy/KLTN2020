import React from 'react';
import {
    FaMapMarkedAlt,
    FaMap,
    FaHandHoldingUsd,
    FaChartArea,
} from 'react-icons/fa';
import { MAP_MODE } from '../util/constants';

const PageLeft = ({ setTabmap, tabMap }) => {
    return (
        <div
            className="dark:bg-gray-900 bg-white border-r border-solid border-light-primary dark:border-primary flex items-center flex-col pt-10"
            style={{ width: '64px' }}
        >
            <FaMapMarkedAlt
                className={`mt-8 cursor-pointer shadow-sm ${
                    tabMap === MAP_MODE.AREA_MODE ? 'text-blue-600' : ''
                }`}
                size={24}
                onClick={() => setTabmap(MAP_MODE.AREA_MODE)}
            />
            <FaMap
                size={24}
                className={`mt-8 cursor-pointer shadow-sm ${
                    tabMap === MAP_MODE.DENSITY_MODE ? 'text-blue-600' : ''
                }`}
                onClick={() => setTabmap(MAP_MODE.DENSITY_MODE)}
            />
            {/* <FaMapMarkedAlt
                size={24}
                className={`mt-8 cursor-pointer shadow-sm ${
                    tabMap === MAP_MODE.POSITION_MODE ? 'text-blue-600' : ''
                }`}
                onClick={() => setTabmap(MAP_MODE.POSITION_MODE)}
            /> */}
            <FaHandHoldingUsd
                size={24}
                className={`mt-8 cursor-pointer shadow-sm ${
                    tabMap === MAP_MODE.PRICE_MODE ? 'text-blue-600' : ''
                }`}
                onClick={() => setTabmap(MAP_MODE.PRICE_MODE)}
            />
            <div />
        </div>
    );
};

export default PageLeft;

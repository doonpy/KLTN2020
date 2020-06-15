import React from 'react';
import { AiFillDollarCircle } from 'react-icons/ai';
import { GiSwitzerland } from 'react-icons/gi';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { MAP_MODE } from '../../util/constants.js';
import * as action from '../../store/mode-map/actions';

const MapLeafLeftSide = ({ resetState }) => {
    const dispatch = useDispatch();
    const { modeMap } = useSelector((state) => state.modeMap);
    return (
        <div
            className="h-full absolute bg-black"
            style={{
                width: '45px',
                zIndex: 9999,
                top: '10%',
                backgroundColor: 'rgba(0,0,0,0)',
            }}
        >
            <div className="flex justify-center flex-col items-center mt-4">
                <GiSwitzerland
                    size={32}
                    className={`${
                        modeMap === MAP_MODE.AREA_MODE ? `text-blue-600` : ``
                    } mt-2`}
                    onClick={() => {
                        dispatch(action.getMapMode(MAP_MODE.AREA_MODE));
                        resetState();
                    }}
                />
                <AiFillDollarCircle
                    size={32}
                    className={`${
                        modeMap === MAP_MODE.PRICE_MODE ? `text-blue-600` : ``
                    } mt-4`}
                    onClick={() => {
                        dispatch(action.getMapMode(MAP_MODE.PRICE_MODE));
                        resetState();
                    }}
                />
            </div>
        </div>
    );
};

MapLeafLeftSide.propTypes = {
    resetState: PropTypes.func,
};
export default MapLeafLeftSide;

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
            className="h-full absolute flex flex-col justify-center"
            style={{
                zIndex: 980,
                backgroundColor: 'rgba(0,0,0,0)',
            }}
        >
            <div className="flex justify-center flex-col items-center ml-2 py-8 px-1 rounded-sm bg-white shadow">
                <div className="p-2">
                    <GiSwitzerland
                        size={24}
                        className={`${
                            modeMap === MAP_MODE.AREA_MODE
                                ? `text-primary`
                                : `text-fill`
                        }`}
                        onClick={() => {
                            dispatch(action.getMapMode(MAP_MODE.AREA_MODE));
                            resetState();
                        }}
                    />
                </div>
                <div className="p-2 mt-3">
                    <AiFillDollarCircle
                        size={24}
                        className={`${
                            modeMap === MAP_MODE.PRICE_MODE
                                ? `text-primary`
                                : `text-fill`
                        }`}
                        onClick={() => {
                            dispatch(action.getMapMode(MAP_MODE.PRICE_MODE));
                            resetState();
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

MapLeafLeftSide.propTypes = {
    resetState: PropTypes.func,
};
export default MapLeafLeftSide;

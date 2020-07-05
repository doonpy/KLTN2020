import React from 'react';
import { AiFillDollarCircle } from 'react-icons/ai';
import { GiSwitzerland } from 'react-icons/gi';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHover } from '../../hooks/use-hover';
import { MAP_MODE } from '../../util/constants.js';
import * as action from '../../store/mode-map/actions';

const HoverItemLeftSide = ({ title }) => {
    return (
        <div
            className="text-primary text-xs tracking-wider absolute bg-white text-center font-semibold"
            style={{
                zIndex: 999,
                left: '3rem',
                width: '150px',
                padding: '4px 0 4px 0px',
                border: 'solid 1px #0bb783',
            }}
        >
            {title}
        </div>
    );
};

HoverItemLeftSide.propTypes = {
    title: PropTypes.string.isRequired,
};

const MapLeafLeftSide = ({ resetState }) => {
    const [hoverArea, isArea] = useHover();
    const [hoverPrice, isPrice] = useHover();
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
                <div
                    className="p-2 flex flex-row justify-center items-center"
                    ref={hoverArea}
                >
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
                    {isArea ? <HoverItemLeftSide title="Diện tích" /> : null}
                </div>
                <div
                    className="p-2 mt-3 flex flex-row justify-center items-center"
                    ref={hoverPrice}
                >
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
                    {isPrice ? <HoverItemLeftSide title="Giá " /> : null}
                </div>
            </div>
        </div>
    );
};

MapLeafLeftSide.propTypes = {
    resetState: PropTypes.func,
};
export default MapLeafLeftSide;

import React from 'react';
import { FaMapMarkedAlt, FaMap } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import * as action from '../store/mode-map/actions';
import { MAP_MODE } from '../util/constants';
import { useHover } from '../hooks/use-hover';

const HoverItem = ({ title }) => {
    return (
        <div
            className="text-xs tracking-wider absolute bg-white text-center font-semibold"
            style={{
                zIndex: 999,
                left: '3.4rem',
                width: '150px',
                padding: '16px 0 16px 0px',
                border: 'solid 1px #0bb783',
            }}
        >
            {title}
        </div>
    );
};
HoverItem.propTypes = {
    title: PropTypes.string.isRequired,
};
const PageLeft = () => {
    const [hoverRef, isHovered] = useHover();
    const [hoverDensity, isDensity] = useHover();

    const dispatch = useDispatch();
    const { modeMap } = useSelector((state) => state.modeMap);

    return (
        <div
            className="dark:bg-primary bg-white border-r border-solid border-light-primary dark:border-primary flex items-center flex-col mt-1 "
            style={{ width: '80px' }}
        >
            <div className="mt-16 w-full flex justify-center items-center flex-col">
                <div
                    className={`flex items-center relative justify-center hover:bg-white-bg hover:text-primary rounded-sm cursor-pointer mb-4 ${
                        modeMap !== MAP_MODE.DENSITY_MODE
                            ? 'text-primary bg-white-bg'
                            : 'text-fill'
                    }`}
                    ref={hoverRef}
                    role="presentation"
                    onClick={() =>
                        dispatch(action.getMapMode(MAP_MODE.AREA_MODE))
                    }
                    style={{
                        height: 'calc(1.5em + 1.65rem + 2px)',
                        width: 'calc(1.5em + 1.65rem + 2px)',
                        borderColor: 'transparent',
                    }}
                >
                    <FaMapMarkedAlt size={24} />
                    {isHovered ? <HoverItem title="Bản đồ vị trí " /> : null}
                </div>
                {/*  */}
                <div
                    className={`flex items-center relative justify-center hover:bg-white-bg hover:text-primary cursor-pointer rounded-sm mb-2 ${
                        modeMap === MAP_MODE.DENSITY_MODE
                            ? 'text-primary bg-white-bg'
                            : 'text-fill'
                    }`}
                    ref={hoverDensity}
                    onClick={() =>
                        dispatch(action.getMapMode(MAP_MODE.DENSITY_MODE))
                    }
                    role="presentation"
                    style={{
                        height: 'calc(1.5em + 1.65rem + 2px)',
                        width: 'calc(1.5em + 1.65rem + 2px)',
                        borderColor: 'transparent',
                    }}
                >
                    <FaMap size={24} />
                    {isDensity ? (
                        <HoverItem title="Bản đồ xem mật độ " />
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default PageLeft;

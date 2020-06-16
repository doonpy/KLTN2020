import React from 'react';
import PropTypes from 'prop-types';
import { FaRegTimesCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import {
    setColorByArea,
    setColorByPrice,
    numberWithCommas,
} from '../../util/services/helper';
import { MAP_MODE, UNIT_OF_MEASURE } from '../../util/constants';

const AREA_LEGEND = [0, 50, 100, 500, 1000, 5000, 10000, 50000, 100000];
const PRICE_LEGEND = [0, 0.5, 1, 5, 10, 50, 100, 500, 1000, 5000];
const MILLION = 'Triệu';
const BILLION = 'Tỷ';

const LegendMap = ({ typeLegend, setOnLegend }) => {
    const { colorPoint } = useSelector((state) => state.colorPoint);

    const grades =
        typeLegend === MAP_MODE.AREA_MODE ? AREA_LEGEND : PRICE_LEGEND;

    const unitOfMeasure =
        typeLegend === MAP_MODE.AREA_MODE
            ? `${UNIT_OF_MEASURE.SQUARE_METER}`
            : `${BILLION} ${UNIT_OF_MEASURE.VND}`;
    const colorPointLegend = (unit) => {
        if (typeLegend === MAP_MODE.AREA_MODE) return setColorByArea(unit);
        return setColorByPrice(unit);
    };
    let fromScope;
    let toCope;
    return (
        <div className="border relative mt-4">
            <div
                className="bg-gray-900 flex justify-center items-center relative"
                style={{ height: '25px' }}
            >
                Chú thích
                <FaRegTimesCircle
                    className="absolute right-0 mr-2 cursor-pointer"
                    onClick={() => {
                        setOnLegend(false);
                    }}
                />
            </div>
            <div className="px-4 py-4" style={{ backgroundColor: '#191919' }}>
                <ul>
                    {grades.map((e, index) => {
                        fromScope = grades[index];
                        toCope = grades[index + 1];
                        return (
                            <li
                                className="flex my-2"
                                key={e}
                                style={{
                                    color:
                                        colorPointLegend(fromScope) ===
                                        colorPoint
                                            ? `#9ADBF9`
                                            : '',
                                }}
                            >
                                <i
                                    style={{
                                        backgroundColor: `${colorPointLegend(
                                            fromScope
                                        )}`,
                                        boxShadow:
                                            colorPointLegend(fromScope) ===
                                            colorPoint
                                                ? `1px 0px 19px 4px ${colorPointLegend(
                                                      fromScope
                                                  )}, inset 0px 0px 20px rgba(255, 255, 255, 0.5)`
                                                : '',
                                    }}
                                    className="colorcircle"
                                />
                                <div>
                                    {fromScope < 1
                                        ? fromScope * 1000
                                        : `${numberWithCommas(fromScope)}`}
                                </div>

                                {toCope ? (
                                    <div className="flex">
                                        <span className="mx-2"> &ndash; </span>
                                        <div>
                                            {toCope < 1
                                                ? ` ${
                                                      toCope * 1000
                                                  } ${unitOfMeasure.replace(
                                                      BILLION,
                                                      MILLION
                                                  )}`
                                                : `${numberWithCommas(
                                                      toCope
                                                  )}  ${unitOfMeasure}`}
                                        </div>
                                    </div>
                                ) : (
                                    `${unitOfMeasure} trở lên`
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

LegendMap.propTypes = {
    typeLegend: PropTypes.string,
    setOnLegend: PropTypes.func,
};
export default LegendMap;

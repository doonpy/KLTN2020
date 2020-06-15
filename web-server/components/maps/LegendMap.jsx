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
const PRICE_LEGEND = [0, 0.1, 0.5, 1, 5, 10, 50, 100, 500, 1000, 5000];

const LegendMap = ({ typeLegend, setOnLegend }) => {
    const { colorPoint } = useSelector((state) => state.colorPoint);

    const grades =
        typeLegend === MAP_MODE.AREA_MODE ? AREA_LEGEND : PRICE_LEGEND;

    const unitOfMeasure =
        typeLegend === MAP_MODE.AREA_MODE
            ? `${UNIT_OF_MEASURE.SQUARE_METER}`
            : `Tỷ ${UNIT_OF_MEASURE.VND}`;
    const colorPointLegend = (unit) => {
        if (typeLegend === MAP_MODE.AREA_MODE) return setColorByArea(unit);
        return setColorByPrice(unit);
    };
    let from;
    let to;

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
                        from = grades[index];
                        to = grades[index + 1];
                        return (
                            <li
                                className="flex my-2"
                                key={e}
                                style={{
                                    color:
                                        colorPointLegend(from) === colorPoint
                                            ? `#9ADBF9`
                                            : '',
                                }}
                            >
                                <i
                                    style={{
                                        backgroundColor: `${colorPointLegend(
                                            from
                                        )}`,
                                        boxShadow:
                                            colorPointLegend(from) ===
                                            colorPoint
                                                ? `1px 0px 19px 4px ${colorPointLegend(
                                                      from
                                                  )}, inset 0px 0px 20px rgba(255, 255, 255, 0.5)`
                                                : '',
                                    }}
                                    className="colorcircle"
                                />
                                <div>
                                    {from < 1
                                        ? from * 1000
                                        : `${numberWithCommas(from)}`}
                                </div>

                                {to ? (
                                    <div className="flex">
                                        <span className="mx-2"> &ndash; </span>
                                        <div>
                                            {to < 1
                                                ? ` ${
                                                      to * 1000
                                                  } ${unitOfMeasure.replace(
                                                      'Tỷ',
                                                      'Triệu'
                                                  )}`
                                                : `${numberWithCommas(
                                                      to
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

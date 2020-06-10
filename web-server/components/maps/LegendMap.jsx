import React from 'react';
import PropTypes from 'prop-types';
import { FaRegTimesCircle } from 'react-icons/fa';
import {
    setColorByArea,
    setColorByPrice,
    numberWithCommas,
} from '../../util/services/helper';
import { MAP_MODE } from '../../util/constants';

const LegendArea = ({ zoomLevel, typeLegend, setOnLegend }) => {
    const grades =
        typeLegend === MAP_MODE.AREA_MODE
            ? [0, 500, 800, 1000, 5000, 10000, 50000, 100000]
            : [
                  0,
                  1000000000,
                  5000000000,
                  10000000000,
                  30000000000,
                  50000000000,
                  100000000000,
                  500000000000,
                  1000000000000,
                  5000000000000,
              ];

    const unitOfMeasure = typeLegend === MAP_MODE.AREA_MODE ? ` m2` : ' VND';
    let from;
    let to;
    return (
        <div className="border relative mt-4">
            <div
                className="bg-gray-900 flex justify-center items-center relative"
                style={{ height: '25px' }}
            >
                Legend
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
                            <li className="flex my-2" key={e}>
                                <i
                                    className="colorcircle"
                                    style={{
                                        backgroundColor: `${
                                            typeLegend === MAP_MODE.AREA_MODE
                                                ? setColorByArea(from)
                                                : setColorByPrice(from)
                                        }`,
                                    }}
                                />
                                <div>{`${numberWithCommas(from)}`}</div>

                                {to ? (
                                    <div className="flex">
                                        <span className="mx-2"> &ndash; </span>
                                        <div>
                                            {`${numberWithCommas(
                                                to
                                            )}${unitOfMeasure}`}
                                        </div>
                                    </div>
                                ) : (
                                    `${unitOfMeasure} +`
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default LegendArea;

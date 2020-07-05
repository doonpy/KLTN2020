import React from 'react';
import PropTypes from 'prop-types';
import { FaRegTimesCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { setColor, numberWithCommas } from '../../util/services/helper';
import {
    MAP_MODE,
    UNIT_OF_MEASURE,
    PRICE_LEGEND,
    AREA_LEGEND,
} from '../../util/constants';

const MILLION = 'Triệu';
const BILLION = 'Tỷ';

const LegendMap = ({ typeLegend, setOnLegend, transactionStage }) => {
    const { colorPoint } = useSelector((state) => state.colorPoint);

    const TYPE_PRICE =
        transactionStage !== 2
            ? PRICE_LEGEND
            : PRICE_LEGEND.filter((c) => c < 5000);
    const grades = typeLegend === MAP_MODE.AREA_MODE ? AREA_LEGEND : TYPE_PRICE;

    const unit =
        typeLegend === MAP_MODE.AREA_MODE
            ? `${UNIT_OF_MEASURE.SQUARE_METER}`
            : `${BILLION} ${UNIT_OF_MEASURE.VND}`;
    const colorPointLegend = (measure) => {
        if (typeLegend === MAP_MODE.AREA_MODE)
            return setColor(measure, AREA_LEGEND);
        return setColor(measure, PRICE_LEGEND);
    };

    let fromScope;
    let toCope;
    return (
        <div className="border relative mt-4 shadow dark:border-white">
            <div
                className=" flex justify-center items-center relative bg-white text-primary dark:text-white font-bold border-b boder-primary border-solid"
                style={{ height: '25px', borderBottom: '1px solid #ebedf3' }}
            >
                Chú thích
                <FaRegTimesCircle
                    className="absolute right-0 mr-2 cursor-pointer"
                    onClick={() => {
                        setOnLegend(false);
                    }}
                />
            </div>
            {/*  */}
            <div className="px-4 py-4 dark:bg-dark bg-white text-dark dark:text-white font-normal">
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
                                <div>{numberWithCommas(fromScope)}</div>

                                {toCope ? (
                                    <div className="flex">
                                        <span className="mx-2"> &ndash; </span>
                                        <div>
                                            {`${numberWithCommas(
                                                toCope
                                            )}  ${unit}`}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pl-1">{`${unit} trở lên`}</div>
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
    transactionStage: PropTypes.number,
    setOnLegend: PropTypes.func,
};
export default LegendMap;

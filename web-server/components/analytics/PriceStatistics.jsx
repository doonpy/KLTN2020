import React from 'react';
import PropTypes from 'prop-types';
import { UNIT_OF_MEASURE } from '../../util/constants';

const BILLION = {
    unit: 'tr/m²',
    value: 1000000,
};
const MILLION = { unit: 'tỷ', value: 100000000 };

const PriceStatisticsCard = ({ titlePrice, valuePrice, unitPrice }) => {
    return (
        <div className="w-1/3 p-3">
            <style jsx>{`
                .card {
                    background-color: #fff;
                    background-clip: border-box;
                    border-radius: 0.42rem;
                    box-shadow: 0 0 30px 0 rgba(82, 63, 105, 0.05);
                    border: 0;
                }
            `}</style>
            <div className="bg-gray-900 border border-gray-800 rounded shadow p-2 card">
                <div className="flex flex-row items-center">
                    <div className="flex-shrink pr-4">
                        <div className="rounded p-3 bg-green-600">
                            <i className="fa fa-wallet fa-2x fa-fw fa-inverse" />
                        </div>
                    </div>
                    <div className="flex-1 text-right md:text-center">
                        <h5 className="font-bold uppercase text-gray-400">
                            {titlePrice}
                        </h5>
                        <h3 className="font-bold text-gray-600">
                            <div className="flex justify-center items-center">
                                <div className="text-3xl">
                                    {Math.round(valuePrice * 1000) / 1000}
                                </div>
                                <div className="pl-2 text-2xl">{unitPrice}</div>
                            </div>
                            <span className="text-green-500">
                                <i className="fas fa-caret-up" />
                            </span>
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    );
};
PriceStatisticsCard.propTypes = {
    titlePrice: PropTypes.string,
    valuePrice: PropTypes.number,
    unitPrice: PropTypes.string,
};
const PriceStatistics = ({
    minPrice,
    maxPrice,
    minPricePerMeter,
    maxPricePerMeter,
    amountTotal,
    averagePrice,
}) => {
    return (
        <div className="flex flex-wrap w-full  mt-8">
            <PriceStatisticsCard
                titlePrice="Giá cao nhất"
                valuePrice={maxPrice / MILLION.value}
                unitPrice={MILLION.unit}
            />
            <PriceStatisticsCard
                titlePrice="Giá thấp nhất"
                valuePrice={minPrice / MILLION.value}
                unitPrice={MILLION.unit}
            />
            <PriceStatisticsCard
                titlePrice="Giá trên m² cao nhất"
                valuePrice={maxPricePerMeter / BILLION.value}
                unitPrice={BILLION.unit}
            />
            <PriceStatisticsCard
                titlePrice="Giá trên m² thấp nhất"
                valuePrice={minPricePerMeter / BILLION.value}
                unitPrice={BILLION.unit}
            />
            <PriceStatisticsCard
                valuePrice={amountTotal}
                titlePrice="Số lượng BĐS"
            />
            <PriceStatisticsCard
                valuePrice={averagePrice / BILLION.value}
                titlePrice="Giá trung bình"
                unitPrice={BILLION.unit}
            />
        </div>
    );
};

PriceStatistics.propTypes = {
    minPrice: PropTypes.number,
    maxPrice: PropTypes.number,
    minPricePerMeter: PropTypes.number,
    maxPricePerMeter: PropTypes.number,
    amountTotal: PropTypes.any,
    averagePrice: PropTypes.any,
};
export default PriceStatistics;

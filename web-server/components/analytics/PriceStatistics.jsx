import React from 'react';
import PropTypes from 'prop-types';

const PriceStatisticsCard = ({ titlePrice, valuePrice }) => {
    return (
        <div className="w-1/4 p-3">
            <div className="bg-gray-900 border border-gray-800 rounded shadow p-2">
                <div className="flex flex-row items-center">
                    <div className="flex-shrink pr-4">
                        <div className="rounded p-3 bg-green-600">
                            <i className="fa fa-wallet fa-2x fa-fw fa-inverse" />
                        </div>
                    </div>
                    <div className="flex-1 text-right md:text-center">
                        <h5 className="font-bold uppercase text-gray-400">
                            Giá cao nhất
                        </h5>
                        <h3 className="font-bold text-3xl text-gray-600">
                            12 TỶ
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
};
const PriceStatistics = () => {
    return (
        <div className="flex flex-wrap w-full  mt-8">
            <PriceStatisticsCard />
            <PriceStatisticsCard />
            <PriceStatisticsCard />
            <PriceStatisticsCard />
        </div>
    );
};

export default PriceStatistics;

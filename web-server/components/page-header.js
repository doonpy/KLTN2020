import React from 'react';
import { useSelector } from 'react-redux';
import { numberWithCommas, calculatePercentage } from '../util/services/helper';

const HambugerButton = () => {
    return (
        <div className="block">
            <button
                type="button"
                className="flex items-center px-3 py-2 border rounded text-white border-text-white hover:text-white hover:border-white"
            >
                <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlsns="http://www.w3.org/2000/svg">
                    <title>Menu</title>
                    <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                </svg>
            </button>
        </div>
    );
};
const PageHeader = () => {
    const { saleAmount, rentAmount } = useSelector((state) => state.countDocuments);

    return (
        <nav
            className="w-full bg-gray-900 border-b border-solid border-primay shadow-md"
            style={{ maxHeight: '150px' }}
        >
            <div className="w-full container mx-auto flex flex-wrap items-center">
                <div className="w-1/2 pl-2 md:pl-0">
                    <a
                        className="text-gray-100 text-base xl:text-xl no-underline hover:no-underline font-bold"
                        href="/#"
                    >
                        Real Estate Data Visualization
                    </a>
                </div>
                <div className="w-1/2">
                    <div className="w-full flex justify-end py-2 ">
                        <div
                            className="border border-solid border-primay flex p-2 justify-center items-center flex mx-3"
                            style={{ color: '#CCFF33' }}
                        >
                            <div>
                                <div className="font-medium text-xs">Bất động sản bán</div>
                                <h1 className="text-3xl font-bold">{numberWithCommas(saleAmount)}</h1>
                            </div>
                            <div className="ml-3 text-xs flex flex-col items-center">
                                <div>Tỷ lệ</div>
                                <div>{`${calculatePercentage(saleAmount, saleAmount + rentAmount)} %`}</div>
                            </div>
                        </div>
                        <div className="text-white border border-solid border-primay flex p-2 justify-center items-center flex-col">
                            <div className="font-medium text-xs">Tổng dữ liệu bất động sản</div>
                            <h1 className="text-white text-3xl font-bold">
                                {numberWithCommas(saleAmount + rentAmount)}
                            </h1>
                        </div>
                        <div
                            className="text-white border border-solid border-primay flex p-2 justify-center items-center flex mx-3"
                            style={{ color: '#FF3300' }}
                        >
                            <div className="flex flex-col items-center">
                                <div className="font-medium text-xs">Bất động sản thuê</div>
                                <h1 className="text-3xl font-bold">{numberWithCommas(rentAmount)}</h1>
                            </div>
                            <div className="ml-3 text-xs flex flex-col items-center font-bold">
                                <div>Tỷ lệ</div>
                                <div>{`${calculatePercentage(rentAmount, saleAmount + rentAmount)} %`}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default PageHeader;

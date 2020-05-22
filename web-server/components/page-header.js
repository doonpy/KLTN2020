import React from 'react';
import { FaChartBar, FaHome, FaChartArea } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { numberWithCommas, calculatePercentage } from '../util/services/helper';
import MenuItemHeader from './MenuItemHeader';

const PageHeader = () => {
    const { saleAmount, rentAmount } = useSelector((state) => state.countDocuments);

    return (
        <nav
            className="w-full bg-gray-900 border-b border-solid border-primay shadow-md block"
            style={{ height: '100px', minHeight: '100px' }}
        >
            <div className="w-full container mx-auto flex flex-wrap items-center">
                <div className="w-1/2 pl-2 md:pl-0">
                    <div className="flex flex-col">
                        <div className="text-gray-100 text-base xl:text-xl no-underline hover:no-underline font-bold flex items-center">
                            <FaChartArea className="mr-2" size={32} />
                            Analysis of Real Estate data HoChiMinh City
                        </div>

                        <ul className="list-reset lg:flex flex-1 items-center px-4 md:px-0">
                            <MenuItemHeader href="/">
                                <FaHome />
                                <span className="pb-1 md:pb-0 text-sm ml-2">Home</span>
                            </MenuItemHeader>
                            <MenuItemHeader href="/analytics">
                                <FaChartBar />
                                <span className="pb-1 md:pb-0 text-sm ml-2">Analytics</span>
                            </MenuItemHeader>
                        </ul>
                    </div>
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

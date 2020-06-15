import React from 'react';
import { FaChartBar, FaHome, FaChartArea } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { numberWithCommas, calculatePercentage } from '../util/services/helper';
import useCountDocument from '../hooks/use-countdocument';
import MenuItemHeader from './MenuItemHeader';

const ThemeSwitch = dynamic(() => import('./ThemeSwitch'), { ssr: false });
const PageHeader = () => {
    const { data: sale } = useCountDocument(1);
    const { data: rent } = useCountDocument(2);
    const saleAmount = sale?.documentAmount;
    const rentAmount = rent?.documentAmount;

    return (
        <nav
            className="w-full bg-white dark:bg-gray-900 bg-white border-light-primary border-b border-solid border-light-primary dark:border-primary shadow block relative"
            style={{ height: '100px', minHeight: '100px', maxWidth: '100%' }}
        >
            <div
                className="absolute right-0 mr-4 flex items-center"
                style={{ height: '100px' }}
            >
                <ThemeSwitch />
            </div>
            <div className="w-full container mx-auto flex flex-wrap items-center ">
                <div className="w-1/2 pl-2 md:pl-0">
                    <div className="flex flex-col">
                        <div className="dark:text-gray-100 text-gray-900 text-base xl:text-xl no-underline hover:no-underline font-bold flex items-center pt-4">
                            <FaChartArea className="mr-2" size={32} />
                            Phân tích dữ liệu bất động sản Thành Phố Hồ Chí Minh
                        </div>

                        <ul className="list-reset lg:flex flex-1 items-center px-4 md:px-0">
                            <MenuItemHeader href="/">
                                <FaHome />
                                <span className="pb-1 md:pb-0 text-sm ml-2">
                                    Trang chủ
                                </span>
                            </MenuItemHeader>
                            <MenuItemHeader href="/analytics">
                                <FaChartBar />
                                <span className="pb-1 md:pb-0 text-sm ml-2">
                                    Phân tích
                                </span>
                            </MenuItemHeader>
                        </ul>
                    </div>
                </div>
                <div className="w-1/2">
                    {saleAmount >= 0 && rentAmount >= 0 ? (
                        <div className="w-full flex justify-end py-2 ">
                            <div
                                className="border border-solid border-light-primary dark:border-primary flex p-2 justify-center items-center flex mx-3"
                                style={{ color: '#CCFF33' }}
                            >
                                <div>
                                    <div className="font-medium text-xs">
                                        Bất động sản bán
                                    </div>
                                    <h1 className="text-3xl font-bold">
                                        {numberWithCommas(saleAmount)}
                                    </h1>
                                </div>
                                <div className="ml-3 text-xs flex flex-col items-center">
                                    <div>Tỷ lệ</div>
                                    <div>
                                        {`${calculatePercentage(
                                            saleAmount,
                                            saleAmount + rentAmount
                                        )} %`}
                                    </div>
                                </div>
                            </div>
                            <div className="dark:text-white text-gray-900 border border-solid border-light-primary dark:border-primary flex p-2 justify-center items-center flex-col">
                                <div className="font-medium text-xs">
                                    Tổng dữ liệu bất động sản
                                </div>
                                <h1 className="dark:text-white text-gray-900 text-3xl font-bold">
                                    {numberWithCommas(saleAmount + rentAmount)}
                                </h1>
                            </div>
                            <div
                                className="border border-solid border-light-primary dark:border-primary flex p-2 justify-center items-center flex mx-3"
                                style={{ color: '#FF3300' }}
                            >
                                <div className="flex flex-col items-center">
                                    <div className="font-medium text-xs">
                                        Bất động sản thuê
                                    </div>
                                    <h1 className="text-3xl font-bold">
                                        {numberWithCommas(rentAmount)}
                                    </h1>
                                </div>
                                <div className="ml-3 text-xs flex flex-col items-center font-bold">
                                    <div>Tỷ lệ</div>
                                    <div>
                                        {`${calculatePercentage(
                                            rentAmount,
                                            saleAmount + rentAmount
                                        )} %`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </nav>
    );
};

export default PageHeader;

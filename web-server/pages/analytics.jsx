import React from 'react';
import { useSelector } from 'react-redux';
import Router from 'next/router';
import Head from 'next/head';
import groupBy from 'lodash.groupby';
import NProgress from 'nprogress';
import PageLayout from '../components/page-layout';
import PropertyLineChartWrapper from '../components/ChartWrapper/PropertyLineChartWrapper';
import AnalysticsSelect from '../components/analytics/AnalysticsSelect';
import PriceStatistics from '../components/analytics/PriceStatistics';
import PricePeratoWrapper from '../components/ChartWrapper/PricePeratoWrapper';
import Loading from '../components/Loading';
import TransactionLinChartWrapper from '../components/ChartWrapper/TransactionLineChartWrapper';
import { getTimeAgo } from '../util/services/helper';
import useAnalytics from '../hooks/use-analytics';

NProgress.configure({
    minimum: 0.3,
    easing: 'ease',
    speed: 800,
    showSpinner: true,
});
Router.events.on('routeChangeStart', () => {
    NProgress.start();
});
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const Analytics = () => {
    const analytics = useSelector((state) => state.analytics);
    const { data: dataAnalytics, isValidating } = useAnalytics({
        variables: {
            fromMonth: JSON.stringify(getTimeAgo(analytics.time).month),
            fromYear: JSON.stringify(getTimeAgo(analytics.time).year),
            propertyType: analytics.propertyType,
            transactionType: analytics.transactionType,
        },
    });

    const dataSortByMonthYear = dataAnalytics?.analytics?.sort(
        (a, b) => a.year - b.year || a.month - b.month
    );
    const dataPriceMax =
        dataSortByMonthYear?.find((c) => Math.max(c.priceMax)) || 0;
    const dataPriceMin =
        dataSortByMonthYear?.find((c) => Math.min(c.priceMin)) || 0;
    const dataPerMeterMin =
        dataSortByMonthYear?.find((c) => Math.min(c.perMeterMin)) || 0;
    const dataPerMeterMax =
        dataSortByMonthYear?.find((c) => Math.max(c.perMeterMax)) || 0;

    const amountTotal =
        dataSortByMonthYear?.reduce((sum, p) => sum + p.amount, 0) || 0;

    const averagePrice =
        dataAnalytics?.analytics?.reduce(
            (sum, p) => sum + p.perMeterSum / p.amount,
            0
        ) / dataSortByMonthYear?.length || 0;

    const dataGroupBy = groupBy(
        dataSortByMonthYear,
        (data) => `${data.month}-${data.year}`
    );

    return (
        <>
            {dataSortByMonthYear ? (
                <PageLayout>
                    <Head>
                        <title>Trang Phân tích</title>
                        <meta
                            name="viewport"
                            content="initial-scale=1.0, width=device-width"
                        />
                    </Head>
                    <div
                        className="max-w-screen-xl m-auto text-white pb-64"
                        style={{ color: '#BDD1F8', paddingTop: '100px' }}
                    >
                        <div className="flex flex-col h-full">
                            {dataAnalytics && (
                                <PriceStatistics
                                    maxPrice={+dataPriceMax.priceMax || 0}
                                    minPrice={
                                        Number(dataPriceMin.priceMin) || 0
                                    }
                                    minPricePerMeter={
                                        +dataPerMeterMin.perMeterMin || 0
                                    }
                                    maxPricePerMeter={
                                        +dataPerMeterMax.perMeterMax || 0
                                    }
                                    amountTotal={amountTotal}
                                    averagePrice={averagePrice}
                                />
                            )}

                            <div className="w-full h-full">
                                <div className="flex">
                                    <AnalysticsSelect />
                                    <PricePeratoWrapper
                                        dataGroupBy={dataGroupBy}
                                        loading={!dataAnalytics && isValidating}
                                    />
                                </div>
                                <hr className="border-b-2 border-gray-600 my-8 mx-4" />
                                <div className="flex mt-12">
                                    <div className="w-full ml-2">
                                        <TransactionLinChartWrapper
                                            data={dataAnalytics}
                                            catagoriesYear={Object.keys(
                                                dataGroupBy
                                            )}
                                        />
                                    </div>
                                </div>
                                <PropertyLineChartWrapper
                                    data={dataAnalytics}
                                    catagoriesYear={Object.keys(dataGroupBy)}
                                />
                            </div>
                        </div>
                    </div>
                </PageLayout>
            ) : (
                <div className="flex bg-gray-900 w-full justify-center h-screen">
                    <Loading />
                </div>
            )}
        </>
    );
};

export default Analytics;

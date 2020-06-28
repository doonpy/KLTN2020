import React from 'react';
import { useSelector } from 'react-redux';
import Router from 'next/router';
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

const Analytics = ({ analyticsData }) => {
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
        dataSortByMonthYear?.reduce(
            (sum, p) => sum + p.perMeterSum / p.amount,
            0
        ) / dataSortByMonthYear?.length || 0;

    const dataGroupBy = groupBy(
        dataSortByMonthYear,
        (data) => `${data.month}-${data.year}`
    );

    return (
        <PageLayout>
            <div
                className="max-w-screen-xl m-auto text-white pb-64"
                style={{ color: '#BDD1F8', paddingTop: '100px' }}
            >
                {dataSortByMonthYear ? (
                    <div className="flex flex-col h-full">
                        {dataAnalytics && (
                            <PriceStatistics
                                maxPrice={+dataPriceMax.priceMax || 0}
                                minPrice={+dataPriceMin.priceMin || 0}
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
                ) : (
                    <div
                        style={{
                            height: 'calc(100vh - 100px)',
                        }}
                    >
                        <Loading />
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

// export async function getServerSideProps(context) {
//     const res = await fetch(
//         `${process.env.API_URI}/api/v1/vi/visualization/analytics?fromMonth=6&fromYear=2019&toYear=2020&toMonth=6`
//     );
//     const data = await res.json();
//     console.log(data);

//     // return {
//     //     props: { analyticsData: data },
//     // };
// }
export default Analytics;

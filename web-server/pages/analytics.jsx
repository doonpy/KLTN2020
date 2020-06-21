import React from 'react';
import { useSelector } from 'react-redux';
import Router from 'next/router';
import groupBy from 'lodash.groupby';
import NProgress from 'nprogress';
import PageLayout from '../components/page-layout';
import AnalystLeft from '../components/analytics/analyst-left';
import AnalysticsSelect from '../components/analytics/AnalysticsSelect';
import PeratoWrapper from '../components/ChartWrapper/PeratoWrapper';
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
    const dataSortByMonthYear = dataAnalytics?.analytics?.sort((a, b) => {
        return a.year - b.year || a.month - b.month;
    });

    const dataGroupBy = groupBy(dataSortByMonthYear, function (data) {
        return `${data.month}-${data.year}`;
    });

    return (
        <PageLayout>
            <div className="max-w-screen-xl m-0 m-auto text-white">
                <div
                    className="flex"
                    style={{
                        height: 'calc(100vh - 100px)',
                    }}
                >
                    <div className="w-full h-full">
                        <div className="flex">
                            <AnalysticsSelect />
                            <PeratoWrapper
                                dataGroupBy={dataGroupBy}
                                loading={!dataAnalytics && isValidating}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default Analytics;

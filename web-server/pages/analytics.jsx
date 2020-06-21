import React from 'react';
import sortBy from 'lodash.sortby';
import Router from 'next/router';
import NProgress from 'nprogress';
import LoadingIcon from '../components/LoadingIcon';
import groupBy from 'lodash.groupby';
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
    const { data: dataAnalytics, isValidating } = useAnalytics({
        variables: {
            fromMonth: getTimeAgo(12).month,
            fromYear: getTimeAgo(12).year,
            propertyType: 1,
            transactionType: 1,
        },
    });

    console.log(('dataAnalytics', dataAnalytics));
    const dataSortByMonthYear = dataAnalytics?.analytics.sort((a, b) => {
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
                    {!dataAnalytics && isValidating ? (
                        <div className="w-full items-center">
                            <LoadingIcon />
                        </div>
                    ) : (
                        <div className="w-full h-full">
                            <div className="flex">
                                <AnalysticsSelect />
                                <PeratoWrapper dataGroupBy={dataGroupBy} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default Analytics;

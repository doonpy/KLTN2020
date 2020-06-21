import useSWR from 'swr';
import fetcher from '../util/api/fetcher';

const currentDate = new Date();
export default function useAnalytics({
    variables: {
        fromMonth = '12',
        toMonth = JSON.stringify(currentDate.getMonth() + 1),
        fromYear = '2019',
        toYear = JSON.stringify(currentDate.getFullYear()),
        transactionType = 1,
        propertyType = 1,
    },
}) {
    return useSWR(
        `/api/v1/vi/visualization/analytics?toMonth=${toMonth}&toYear=${toYear}${
            propertyType !== 0 ? `&propertyType=${propertyType}` : ''
        }${transactionType !== 0 ? `&transactionType=${transactionType}` : ''}`,
        fetcher
    );
}

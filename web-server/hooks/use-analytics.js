import useSWR from 'swr';
import fetcher from '../util/api/fetcher';

const currentDate = new Date();
export default function useAnalytics({
    variables: {
        fromMonth,
        toMonth = currentDate.getMonth() + 1,
        fromYear,
        toYear = currentDate.getFullYear(),
        transactionType = 1,
        propertyType = 1,
    },
}) {
    return useSWR(
        `/api/v1/vi/visualization/analytics?transactionType=${transactionType}&propertyType=${propertyType}`,
        fetcher
    );
}

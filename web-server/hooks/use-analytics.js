import useSWR from 'swr';
import fetcher from '../util/api/fetcher';

const currentDate = new Date();
export default function useAnalytics({
    variables: {
        fromMonth,
        toMonth = JSON.stringify(currentDate.getMonth() + 1),
        fromYear,
        toYear = JSON.stringify(currentDate.getFullYear()),
        transactionType = 1,
        propertyType = 1,
    },
}) {
    console.log(JSON.stringify(toMonth));
    // console.log(
    //     `/api/v1/vi/visualization/analytics?fromMonth=${fromMonth}&fromYear=${fromYear}&toMonth=${toMonth}&toYear=${toYear}${
    //         propertyType !== 0 ? `&propertyType=${propertyType}` : ''
    //     }${transactionType !== 0 ? `&transactionType=${transactionType}` : ''}`
    // );
    console.log(
        `/api/v1/vi/visualization/analytics?toMonth=${toMonth}&toYear=${toYear}${
            propertyType !== 0 ? `&propertyType=${propertyType}` : ''
        }${transactionType !== 0 ? `&transactionType=${transactionType}` : ''}`
    );
    return useSWR(
        `/api/v1/vi/visualization/analytics?toMonth=${toMonth}&toYear=${toYear}${
            propertyType !== 0 ? `&propertyType=${propertyType}` : ''
        }${transactionType !== 0 ? `&transactionType=${transactionType}` : ''}`,
        fetcher
    );
}

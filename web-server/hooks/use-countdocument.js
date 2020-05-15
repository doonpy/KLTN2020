import useSWR from 'swr';
import fetcher from '../util/api/fetcher';

export default function useCountDocumentCondition(transactionType, propertyType) {
    return useSWR(
        `/api/v1/vi/raw-dataset/count-document?transactionType=${transactionType}&propertyType=${propertyType}`,
        fetcher
    );
}

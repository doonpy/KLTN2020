import useSWR from 'swr';
import fetcher from '../util/api/fetcher';

export default function useTotalDocuments(transactionType, propertyType) {
    return useSWR(`/api/v1/vi/raw-dataset/count-document?transactionType=${transactionType}`, fetcher);
}

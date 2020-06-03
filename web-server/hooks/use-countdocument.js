import useSWR from 'swr';
import fetcher from '../util/api/fetcher';

export default function useCountDocument(transactionType) {
    return useSWR(
        `/api/v1/vi/raw-dataset/document-amount?transactionType=${transactionType}`,
        fetcher
    );
}

import useSWR from 'swr';
import fetcher from '../util/api/fetcher';

export default function useRawDataDetail(id) {
    return useSWR(id ? `/api/v1/raw-data/${id}` : null, fetcher);
}

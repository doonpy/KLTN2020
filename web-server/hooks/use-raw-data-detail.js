import useSWR from 'swr';
import fetcher from '../util/api/fetcher';

export default function useRawDataDetail(id) {
    return useSWR(id ? `/api/v1/vi/raw-data/${id}?populate=1` : null, fetcher);
}

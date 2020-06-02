import useSWR from 'swr';
import fetcher from '../util/api/fetcher';

export default function useRawDataDetail(id, initialData) {
    return useSWR(`/api/v1/vi/raw-data/${id}?populate=1`, fetcher, {
        initialData,
    });
}

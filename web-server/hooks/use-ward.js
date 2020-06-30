import useSWR from 'swr';
import fetcher from '../util/api/fetcher';

export default function useWard(mapKey) {
    return useSWR(`/api/v1/visualization/summary-district-ward`, fetcher);
}

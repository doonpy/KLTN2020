import useSWR from 'swr';
import fetcher from '../util/api/fetcher';

export default function useDistrict(mapKey) {
    return useSWR(`/api/v1/vi/visualization/summary-district?populate=1`, fetcher);
}

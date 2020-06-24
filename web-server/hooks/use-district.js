import useSWR from 'swr';
import fetcher from '../util/api/fetcher';

export default function useDistrict(mapKey) {
    return useSWR(`/api/v1/visualization/summary-district`, fetcher);
}

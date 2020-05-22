import useSWR from 'swr';
import fetcher from '../util/api/fetcher';

export default function useMapKey(mapKey) {
    return useSWR(`/api/v1/visualization/map`, fetcher);
}

import useSWR from 'swr';
import fetcher from '../util/api/fetcher';

export default function useGroupedData(id) {
    return useSWR(
        id ? `/api/v1/vi/grouped-dataset?items=${id}` : null,
        fetcher
    );
}

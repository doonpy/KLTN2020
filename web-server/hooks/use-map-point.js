/* eslint-disable no-undef */
import useSWR from 'swr';
import fetcher from '../util/api/fetcher';

export default function useMapPoint({
    variables: {
        minAcreage,
        minPrice,
        minLat,
        maxLat,
        minLng,
        maxLng,
        propertyType,
        transactionType,
    },
}) {
    return useSWR(
        `/api/v1/visualization/map-points?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}&minAcreage=${minAcreage}${
            minPrice !== 1 ? `&minPrice=${minPrice}` : ''
        }${propertyType !== 0 ? `&propertyType=${propertyType}` : ''}${
            transactionType !== 0 ? `&transactionType=${transactionType}` : ''
        }`,
        fetcher
    );
}

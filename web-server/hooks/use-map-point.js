/* eslint-disable no-undef */
import useSWR from 'swr';
import fetcher from '../util/api/fetcher';

export default function useMapPoint({
    variables: { minAcreage, maxAcreage, minLat, maxLat, minLng, maxLng, propertyType },
}) {
    return useSWR(
        propertyType
            ? `/api/v1/vi/visualization/map-points?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}&minAcreage=${minAcreage}&maxAcreage=${maxAcreage}`
            : `/api/v1/vi/visualization/map-points?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}&minAcreage=${minAcreage}&maxAcreage=${maxAcreage}&propertyType=${propertyType}`,
        fetcher
    );
}

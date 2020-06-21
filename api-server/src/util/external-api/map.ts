import ResponseStatusCode from '@common/response-status-code';
import { sendRequest } from '../request';
import { BingMapGeocodeResponse } from './interface';
import { AxiosRequestConfig } from 'axios';

/**
 * Get geocode from Bing service
 */
export const getGeocodeByBingMap = async (
    queryAddress: string,
    customizeRequestOptions?: AxiosRequestConfig
): Promise<BingMapGeocodeResponse | undefined> => {
    const requestOptions: AxiosRequestConfig = {
        url: 'https://dev.virtualearth.net/REST/v1/Locations',
        method: 'GET',
        headers: {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            },
        },
        ...customizeRequestOptions,
    };

    const BING_API_KEYS = process.env.BING_API_KEYS!.split(';');
    let apiKey = BING_API_KEYS.shift();
    requestOptions.params = {
        key: apiKey,
        query: queryAddress,
        suppressStatus: true,
        maxResults: 1,
    };
    let { data } = await sendRequest<BingMapGeocodeResponse>(requestOptions);
    while (data.statusCode !== ResponseStatusCode.OK) {
        apiKey = BING_API_KEYS.shift();
        if (!apiKey) return undefined;

        requestOptions.params.key = apiKey;
        data = (await sendRequest<BingMapGeocodeResponse>(requestOptions)).data;
    }
    return data;
};

/**
 * Get geocode from Mapbox service
 */
// export const getGeocodeByMapBox = async (
//     queryAddress: string,
//     customizeRequestOptions?: RequestPromiseOptions
// ): Promise<MapBoxGeocodeResponse | undefined> => {
//     const requestOptions = initRequestOptions(customizeRequestOptions);
//     const apiKey =
//         'pk.eyJ1IjoiZG9vbnB5IiwiYSI6ImNrYW9xd3hjcTB3a3Eycm1vNHhzY250c2sifQ.Ti9ktyjr224DM5eDsXftfQ';
//     requestOptions.qs = {
//         access_token: apiKey,
//         limit: 1,
//     };
//     const endPoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURI(
//         queryAddress
//     )}.json`;
//
//     try {
//         return sendRequest<MapBoxGeocodeResponse>(endPoint, requestOptions);
//     } catch (error) {
//         return undefined;
//     }
// };

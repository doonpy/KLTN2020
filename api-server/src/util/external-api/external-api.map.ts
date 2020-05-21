import { RequestPromiseOptions } from 'request-promise';
import { Response } from 'request';
import Request from '../request/request';

const requestOptionsDefault: RequestPromiseOptions = {
    method: 'GET',
    headers: {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        },
    },
    json: true,
};

/**
 * @param {string} queryAddress
 * @param {'here' | 'bing'}serviceType
 * @param {object} requestOptions
 *
 * @return {Promise<Response>}
 */
export const getGeocode = async (
    queryAddress: string,
    serviceType: 'here' | 'bing',
    requestOptions: object = requestOptionsDefault
): Promise<Response> => {
    let params = '';
    let endPoint = '';

    switch (serviceType) {
        case 'here':
            params += `apiKey=${process.env.HERE_API_KEY ?? ''}&lang=vi-VN&q=${queryAddress}`;
            endPoint = `https://geocode.search.hereapi.com/v1/geocode?${encodeURI(params)}`;
            break;
        case 'bing':
            params += `key=${process.env.BING_API_KEY ?? ''}&query=${queryAddress}`;
            endPoint = `https://dev.virtualearth.net/REST/v1/Locations?${encodeURI(params)}`;
            break;
        default:
            break;
    }

    return new Request(endPoint, requestOptions).send();
};

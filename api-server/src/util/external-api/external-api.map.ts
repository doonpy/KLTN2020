import { RequestPromiseOptions } from 'request-promise';
import { Response } from 'request';
import ResponseStatusCode from '@common/common.response-status.code';
import { sendRequest } from '../request/request';
import { BingMapGeocodeResponse } from './external-api.map.interface';

/**
 * @param {string} queryAddress
 * @param {object} requestOptions
 *
 * @return {Promise<Response>}
 */
export const getGeocode = async (
    queryAddress: string,
    requestOptions?: RequestPromiseOptions
): Promise<BingMapGeocodeResponse | undefined> => {
    let requestOptionsDefault: RequestPromiseOptions = {
        method: 'GET',
        headers: {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            },
        },
        json: true,
    };
    if (requestOptions) {
        requestOptionsDefault = requestOptions;
    }

    const BING_API_KEYS = [
        'ApMeVn2de85sCgrhbvSG99dRStsusJyOmUePGowvPzJdEWjsIkEWP0Y1Jz__FZ_h',
        'Ahk4IGiU-0Qm-DTdqSh7ZbpEjK8su_dwM3OjNOZH4LTyxeQCeoIUwIaHkHhOKy4I',
        'AoaVtDLGAZ68iSaMergzDJxEdg1YlOyWrpcuCvgAqPPp2DmP9jtKEYaBwam_VOgB',
        'AoyJIwQPfyz9521x4S2aKFk8JjG6sQhQpKULdJKDpHhVPW9o09u9elaxRxatKZtl',
        'ArfmrhpVahTUtgC6v7i7Wybwu-mcpx5tPj6TjlXukw-Lkf_zfvpz8aoJ_QxntSwU',
        'AmbdGq6-WCAj13m0k7NbuPFjwYkQW48xxL8EQ-lNqeDRLr9guF0uW9ihhvPcxJoY',
        'AvsnegqIeEvkS_gqxTYPBjNuqdd7oMwoUYSv9SSv6c2oj_tHc4QcuVQYrBHcJF2X',
        'An1yBhLvAw2qU4WEVB06NqSCHeMom55owKknDNuv-39GagAxt2pITv4Tyz8re-CZ',
        'AqSnmzh1QWxntigzRcYQvItgD77cKIj5mBtOCbuJEuRzHxpdh8IE5RWqFdKYPwcn',
        'AtHVvkk1IJv2tgHEppQ5S45ZqmwN1BbePpRtMKHoLsDeIKeuWa_b530TJmb3Ztoo',
        'AhCfe3efxhXThevn9YfCfqst17ic02PDuwPahut69FTzZWIb6Qp8w4SNvJ2qcVaa',
        'Ag3Xf3CqkjcySHfbbfqqr50JTSZFZm0knKk5n0IcL3CQXNi62dwCLFRQ-Sfs9RN3',
        'AgdPdfx6Fly4STtCQ1uBR9S3AI2g_wVceLJBS6ABnsFKd81rtX6k6X292B7ss_Iy',
        'AnH0BUAY0jX5PwuycAStTbnAFOR_fcMS9C0AYAYq5BQ2xUMkZcKis9XUGJXv9kBw',
        'Ar8O205cNc9Thsxq8fVRpp_FhJICXcBkj_Kz1AieCCYyQUtoSH1wtuP6zC8S7tFV',
        'AuUqMJ_xGjSmp5ugJm7Sdh_7k47jNJavEcrswAXrifkOtt8fBaHnb6rkRfJXGAnU',
        'AhHQDLm-2gBdW3rQHWttvg2DadD3Ro2-Rvk1uNDV7O258KVaDihlVuxyxLqgdssz',
        'AhQX3m7GSrxXyKJ96X82CaHFnw1RgVmKNXMqY1mNDH8mo053VP2UzJ-DN4GSOA9m',
        'AmCYxDLaqytonjDlQujqun-e5ctyPiKV78TzYC6R0BJoSvHdnbd2-Xgi3yGtO7cK',
        'AneBpynvZLYL9qb-16hmI1M_KnR61OltrrseXS3mWdZRikmoXXvRi4i8KP06tq5R',
        'AtkJrHa-BZ4SIpfBu0rAbi8hIeiOErrfPomuLQ39WxJ78YBi6kgMvibUHJIW5901',
    ];
    let result: BingMapGeocodeResponse;
    let apiKey = BING_API_KEYS.shift();
    requestOptionsDefault.qs = {
        key: apiKey,
        query: queryAddress,
        suppressStatus: true,
        maxResults: 1,
    };
    const endPoint = `https://dev.virtualearth.net/REST/v1/Locations`;
    result = await sendRequest<BingMapGeocodeResponse>(
        endPoint,
        requestOptionsDefault
    );
    while (result.statusCode !== ResponseStatusCode.OK) {
        apiKey = BING_API_KEYS.shift();
        if (!apiKey) {
            return undefined;
        }
        requestOptionsDefault.qs.key = apiKey;
        result = await sendRequest<BingMapGeocodeResponse>(
            endPoint,
            requestOptionsDefault
        );
    }
    return result;
};

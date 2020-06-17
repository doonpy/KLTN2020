import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Send request
 */
export const sendRequest = async <ResponseDataType>(
    configs: AxiosRequestConfig
): Promise<AxiosResponse<ResponseDataType>> => {
    return axios.request<ResponseDataType>(configs);
};

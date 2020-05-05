import { CommonQueryParams } from '../service/common/service/common.service.interface';

/**
 * @param {CommonQueryParams} queryParams
 *
 * @return {string}
 */
export const convertQueryParamsToString = (queryParams: CommonQueryParams): string => {
    const queryParamsArray: string[] = [];
    for (const key of Object.keys(queryParams)) {
        queryParamsArray.push(`${key}=${(queryParams as { [key: string]: any })[key]}`);
    }

    return queryParamsArray.join('&');
};

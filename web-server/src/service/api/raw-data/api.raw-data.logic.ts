import axios from 'axios';
import { RawDataApiModel, RawDataQueryParams } from './api.raw-data.interface';
import { convertQueryParamsToString } from '../../../util/request-helper';

/**
 * @param {RawDataQueryParams | undefined} queryParams
 * @param {string} version
 * @param {string} language
 *
 * @return {Promise<{ documents: RawDataApiModel[]; hasNext: boolean }>}
 */
const getAll = async (
    queryParams?: RawDataQueryParams,
    version = 'v1',
    language = 'vi'
): Promise<{ rawDataset: RawDataApiModel[]; hasNext: boolean }> => {
    let queryString = '';
    if (queryParams) {
        queryString = convertQueryParamsToString(queryParams);
    }

    const { data }: { data: { rawDataset: RawDataApiModel[]; hasNext: boolean } } = await axios({
        url: `${process.env.API_SERVER_PROTOCOL}://${process.env.API_SERVER_IP}:${process.env.API_SERVER_PORT}/api/${version}/${language}/raw-dataset?${queryString}`,
    });

    return data;
};

const countDocumentsWithConditions = async (
    transactionType?: number,
    propertyType?: number,
    version = 'v1',
    language = 'vi'
): Promise<number> => {
    const { data }: { data: { documentAmount: number } } = await axios({
        url: `${process.env.API_SERVER_PROTOCOL}://${process.env.API_SERVER_IP}:${process.env.API_SERVER_PORT}/api/${version}/${language}/raw-dataset/count-document?transactionType=${transactionType}&propertyType=${propertyType}`,
    });

    return data.documentAmount;
};

export default {
    getAll,
    countDocumentsWithConditions,
};

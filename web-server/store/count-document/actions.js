import { request } from '../../util/api/request-ssr';

export const GET_TOTAL_DOCUMENT = 'GET_TOTAL_DOCUMENT';
export const LOADING_TOTAL_DOCUMENT = 'LOADING_TOTAL_DOCUMENT';

export const fetchTotalSuccess = (total) => {
    return {
        type: GET_TOTAL_DOCUMENT,
        total,
    };
};

export const getTotalRequest = (type) => {
    const transactionTypes = [0, 1];
    const propertyTypes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const documentAmountArray = [];
    return async (dispatch) => {
        try {
            for (const transactionType of transactionTypes) {
                for (const propertyType of propertyTypes) {
                    const res = await request(
                        `${process.env.API_URI}/api/v1/vi/${type}/count-document?transactionType=${transactionType}&propertyType=${propertyType}`
                    );
                    if (!documentAmountArray[transactionType]) {
                        documentAmountArray[transactionType] = [];
                    }
                    documentAmountArray[transactionType].push({ [propertyType]: res.documentAmount });
                }
            }
            // console.log('[RESS: ]', res.documentAmount);
            dispatch(fetchTotalSuccess(documentAmountArray));
        } catch (error) {
            console.log(error.message);
        }
    };
};

import { HYDRATE } from 'next-redux-wrapper';
import { GET_TOTAL_DOCUMENT, LOADING_TOTAL_DOCUMENT } from './actions';

const initialState = {
    total: null,
    saleAmount: null,
    rentAmount: null,
};

export const countDocumentReducer = (state = initialState, action) => {
    switch (action.type) {
        case HYDRATE:
            return action.payload.countDocuments;
        case GET_TOTAL_DOCUMENT: {
            const saleAmount = action.total[0].reduce((sum, item, index) => sum + item[index], 0);
            const rentAmount = action.total[1].reduce((sum, item, index) => sum + item[index], 0);

            return {
                ...state,
                total: action.total,
                saleAmount,
                rentAmount,
            };
        }
        default:
            return state;
    }
};

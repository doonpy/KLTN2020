import { GET_OPTION_ANALYTICS } from './actions';

const SIX_MONTH = 6;
const TRANSACTION_TOTAL = 0;
const PROPERTY_TOTAL = 0;

const initialState = {
    time: SIX_MONTH,
    transactionType: TRANSACTION_TOTAL,
    propertyType: PROPERTY_TOTAL,
};

export const analyticsReducer = (
    state = initialState,
    { type, analytics } = {}
) => {
    switch (type) {
        case GET_OPTION_ANALYTICS:
            return {
                ...state,
                ...analytics,
            };
        default:
            return state;
    }
};

export const GET_OPTION_ANALYTICS = 'GET_OPTION_ANALYTICS';

export const getOptionAnalytics = (analytics) => {
    return {
        type: GET_OPTION_ANALYTICS,
        analytics,
    };
};

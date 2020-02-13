export const Cause = {
    DATA_TYPE: {
        INTEGER: 'Data type of %s must be integer.',
        OBJECT: 'Data type of %s must be object.',
        STRING: 'Data type of %s must be string.',
    },
    DATA_VALUE: {
        DOMAIN: '%s is invalid domain.',
        URL: '%s is invalid URL.',
        OUT_OF_RANGE_SMALLER:
            'The value of %s smaller than range (min is %i but current is %i).',
        OUT_OF_RANGE_LARGER:
            'The value of %s larger than range (max is %i but current is %i).',
        NOT_FOUND: 'Can not find data with %s is %s.',
        EXISTS: 'Data have %s with value %s already exists.',
    },
    DATABASE: 'Database error.',
};

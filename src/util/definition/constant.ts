export const Constant = {
    MESSAGE_TYPE: {
        UNKNOWN: -1,
        INFO: 0,
        ERROR: 1,
        DEBUG: 2,
    },
    MESSAGE_TYPE_TXT: {
        UNKNOWN: '[UNKNOWN]',
        INFO: '[INFO]',
        ERROR: '[ERROR]',
        DEBUG: '[DEBUG]',
    },
    RESPONSE_STATUS_CODE: {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
    },
    DEFAULT_VALUE: {
        LIMIT: 100,
        OFFSET: 0,
    },
};

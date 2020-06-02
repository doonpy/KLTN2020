export default {
    // For development
    DEV_DB_HOST: '127.0.0.1',
    DEV_DB_PORT: '27017',
    DEV_DB_NAME: 'kltn2020-dev',
    DEV_DB_DEBUG_MODE: 1,
    DEV_SERVER_PROTOCOL: 'http',
    DEV_SERVER_DOMAIN: 'localhost',
    DEV_SERVER_PORT: '3000',

    // For production
    PROD_DB_HOST: 'kltn2020-db',
    PROD_DB_PORT: '27017',
    PROD_DB_NAME: 'kltn2020',
    PROD_DB_USERNAME: 'alice',
    PROD_DB_PASS: '',
    PROD_DB_AUTH_DB: 'admin',

    // Background jon config
    BGR_START_ON_SERVER_RUN: 1,
    BGR_THREAD_AMOUNT: 3,
    BGR_SCHEDULE_TIME_HOUR: 19,
    BGR_SCHEDULE_TIME_MINUTE: 0,
    BGR_SCHEDULE_TIME_SECOND: 0,
    BGR_SCRAPE_RAW_DATA_MAX_REQUEST: 20,
    BGR_SCRAPE_DETAIL_URL_MAX_REQUEST: 10,
    BGR_SCRAPE_REQUEST_DELAY: 100, // ms

    // Request
    REQUEST_TIMEOUT: 10000, // ms

    // Chat bot
    CHAT_BOT_TELEGRAM_TOKEN: '1046175359:AAGfHKqnAv0_IFdTEvtLmuanahYW0JWpHKE',
    NTBA_FIX_319: 1,

    // Static folder
    PUBLIC_FOLDER_PATH: 'public',
};

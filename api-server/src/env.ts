export default {
    // For development
    DEV_DB_HOST: '127.0.0.1',
    DEV_DB_PORT: '27017',
    DEV_DB_NAME: 'kltn2020_v2',
    DEV_DB_USERNAME: 'alice',
    DEV_DB_PASS: 'alice',
    DEV_DB_AUTH_DB: 'admin',
    DEV_DB_DEBUG_MODE: 1,
    DEV_SERVER_PROTOCOL: 'http',
    DEV_SERVER_DOMAIN: 'localhost',
    DEV_SERVER_PORT: '3000',

    // For production
    PROD_DB_HOST: '159.65.0.142',
    PROD_DB_PORT: '27017',
    PROD_DB_NAME: 'kltn2020',
    PROD_DB_USERNAME: 'alice',
    PROD_DB_PASS: 'alice',
    PROD_DB_AUTH_DB: 'kltn2020',
    PROD_SERVER_PROTOCOL: 'https',
    PROD_SERVER_DOMAIN: 'pk2020.tk',
    PROD_SERVER_PORT: '3000',

    // Background jon config
    BGR_START_ON_SERVER_RUN: 1,
    BGR_THREAD_AMOUNT: 2,
    BGR_SCHEDULE_TIME_HOUR: 17,
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

    // Map API key
    HERE_API_KEY: 'Lj44tuIaHUz_3SNs7x53jT4vgZeihyAZI2wapXD_-fU',
    BING_API_KEY: 'AlOLUHH31tLfAdbM9VYVSkBrv0oJbnFyFAex72REVpB8QNTBDhwO9CLs2wZJj-Tl',
};

export const ScrapeRawDataConstantChatBotMessage = {
    START:
        '🤖<b>[Scrape raw data]</b>🤖\n📝 Start scrape raw data of catalog <b>%s (ID: %i)</b>...',
    FINISH: `🤖<b>[Scrape raw data]</b>🤖\n✅ Scrape raw data of catalog <b>%s (ID: %i)</b> completed.\nLog file <a href=%s>here</a>.`,
    ERROR: `🤖<b>[Scrape raw data]</b>🤖\n❌ Scrape failed with catalog ID <b>%i</b>.\nError message: %s\nSee log <a href=%s>here</a>.`,
};

export const ScrapeRawDataConstant = {
    ACREAGE_VALUE_PATTERN: new RegExp(
        /(([1-9]+)?0?\.?[0-9]+)|((K|k)hông xác định)|((U|u)ndefined)/
    ),
    ACREAGE_MEASURE_UNIT_PATTERN: new RegExp(/m²|km²/),
    ADDRESS_INDEX: {
        CITY: 4,
        DISTRICT: 3,
        WARD: 2,
        STREET: 1,
        PROJECT: 0,
    },
    TRANSACTION_PATTERN: new RegExp(/(t|T)huê|(r|R)ent/),
    PRICE_VALUE_PATTERN: new RegExp(/(([1-9]+)?0?\.?[0-9]+)|((t|T)hỏa (T|t)huận)|((N|n)egotiated)/),
    PRICE_CURRENCY_PATTERN: new RegExp(
        /(million)|(billion)|(billion vnd\/month)|(million vnd\/month)|(triệu)|(tỷ)|(nghìn\/tháng)|(triệu\/tháng)|(tỷ\/tháng)/
    ),
};

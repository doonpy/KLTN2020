export const ScrapeRawDataConstantChatBotMessage = {
    START: '🤖<b>[Scrape raw data]</b>🤖\n📝 Start scrape raw data of catalog <b>%s (ID: %i)</b>...',
    FINISH: `🤖<b>[Scrape raw data]</b>🤖\n✅ Scrape raw data of catalog <b>%s (ID: %i)</b> completed.`,
    ERROR: `🤖<b>[Scrape raw data]</b>🤖\n❌ Scrape failed with catalog ID <b>%i</b>.\nError message: %s`,
};

export const ScrapeRawDataConstant = {
    VALUE_PATTERN: new RegExp(/(([1-9]+)?0?\.?[0-9]+)/),
    ACREAGE_MEASURE_UNIT_PATTERN: new RegExp(/m²|km²/),
    RENT_TRANSACTION_PATTERN: new RegExp(/([tT])huê|([rR])ent/),
    PRICE_CURRENCY_PATTERN: new RegExp(
        /(million)|(billion)|(billion vnd\/month)|(million vnd\/month)|(triệu)|(tỷ)|(nghìn\/tháng)|(triệu\/tháng)|(tỷ\/tháng)/
    ),
};

export const ScrapeRawDataConstantChatBotMessage = {
    START:
        '🤖<b>[Scrape raw data]</b>🤖\n📝 Start scrape raw data of catalog <b>%s (ID: %i)</b>...',
    FINISH: `🤖<b>[Scrape raw data]</b>🤖\n✅ Scrape raw data of catalog <b>%s (ID: %i)</b> completed.`,
    ERROR: `🤖<b>[Scrape raw data]</b>🤖\n❌ Scrape failed with catalog ID <b>%i</b>.\nError message: %s`,
};

export const ScrapeRawDataConstant = {
    POST_DATE_PATTERN: RegExp(/\d{1,2}(\/|-|.)\d{1,2}(\/|-|.)\d{4}/),
    VALUE_PATTERN: RegExp(/((([1-9]+),*)*[0-9]+(\.[0-9]+)?)/g),
    ACREAGE_PATTERN: RegExp(
        /((([1-9]+),*)*[0-9]+(\.[0-9]+)?)(\s?(m²|m2|km²|km2))/,
        'ig'
    ),
    ACREAGE_MEASURE_UNIT_PATTERN: RegExp(/m²|m2|km²|km2/),
    RENT_TRANSACTION_PATTERN: RegExp(/thuê|rent/, 'i'),

    PRICE_TIME_UNIT_PATTERN: RegExp(
        /(ngày)|(day)|(tháng)|(month)|(năm)|(year)/,
        'i'
    ),
    SALE_PRICE_PATTERN: RegExp(
        /\$?((([1-9]+),*)*[0-9]+(\.[0-9]+)?)(\s?((billion)|(million)|(nghìn)|(triệu)|(tỷ))(\/m²|m2|km²|km2)?)/,
        'ig'
    ),
    RENT_PRICE_PATTERN: RegExp(
        /\$?((([1-9]+),*)*[0-9]+(\.[0-9]+)?)(\s?((billion(\/month)?)|(million(\/month)?)|(nghìn(\/tháng)?)|(triệu(\/tháng)?)|(tỷ(\/tháng)?)))/,
        'ig'
    ),
};

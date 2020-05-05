export const ScrapeRawDataConstantChatBotMessage = {
    START: '🤖<b>[Scrape raw data]</b>🤖\n📝 Start scrape raw data of catalog <b>%s (ID: %i)</b>...',
    FINISH: `🤖<b>[Scrape raw data]</b>🤖\n✅ Scrape raw data of catalog <b>%s (ID: %i)</b> completed.`,
    ERROR: `🤖<b>[Scrape raw data]</b>🤖\n❌ Scrape failed with catalog ID <b>%i</b>.\nError message: %s`,
};

export const ScrapeRawDataConstant = {
    VALUE_PATTERN: new RegExp(/(([1-9]+)?0?\.?[0-9]+)/),
    ACREAGE_PATTERN: new RegExp(/(([1-9]+)?,?0?\.?[0-9]+)(\s?(m²|m2|km²|km2))/, 'i'),
    ACREAGE_MEASURE_UNIT_PATTERN: new RegExp(/m²|m2|km²|km2/),
    RENT_TRANSACTION_PATTERN: new RegExp(/thuê|rent/, 'i'),
    PRICE_VALUE_UNIT_PATTERN: new RegExp(/(million)|(billion)|(triệu)|(tỷ)|(nghìn)|(ngàn)/, 'i'),
    PRICE_TIME_UNIT_PATTERN: new RegExp(/(ngày)|(day)|(tháng)|(month)|(năm)|(year)/, 'i'),
    SALE_PRICE_PATTERN: new RegExp(/\$?(([1-9]+)?,?0?\.?[0-9]+)(\s?((billion)|(million)|(nghìn)|(triệu)|(tỷ)))/, 'i'),
    RENT_PRICE_PATTERN: new RegExp(
        /\$?(([1-9]+)?,?0?\.?[0-9]+)(\s?((billion(\/month)?)|(million(\/month)?)|(nghìn(\/tháng)?)|(triệu(\/tháng)?)|(tỷ(\/tháng)?)))/,
        'i'
    ),
};

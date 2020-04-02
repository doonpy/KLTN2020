export const ScrapeDetailUrlConstantChatBotMessage = {
    START:
        '🤖<b>[Scrape detail URL]</b>🤖\n📝 Start scrape detail URL of catalog <b>%s (ID: %i)</b>...',
    FINISH: `🤖<b>[Scrape detail URL]</b>🤖\n✅ Scrape detail URL of catalog <b>%s (ID: %i)</b> completed.\nLog file <a href=%s>here</a>.`,
    ERROR: `🤖<b>[Scrape detail URL]</b>🤖\n❌ Scrape failed with catalog ID <b>%i</b>.\nError message: %s\nSee log <a href=%s>here</a>.`,
};

export const ScrapeDetailUrlConstantPhase = {
    DETAIL_URL: 'Scrape detail URL of catalog %s (ID: %i)',
    RAW_DATA: 'Scrape raw data of catalog %s (ID: %i)',
};

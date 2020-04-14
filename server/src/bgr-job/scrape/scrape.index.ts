import ScrapeDetailUrl from './detail-url/scrape.detail-url';
import ScrapeRawData from './raw-data/scrape.raw-data';

export namespace BgrScrape {
    export const DetailUrl = ScrapeDetailUrl;
    export type DetailUrl = ScrapeDetailUrl;

    export const RawData = ScrapeRawData;
    export type RawData = ScrapeRawData;
}

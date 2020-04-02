export default class UrlHandler {
    constructor() {}

    /**
     * Remove domain from URL
     *
     * @param url
     */
    public static sanitizeUrl(url: string): string {
        const DOMAIN_PATTERN: RegExp = new RegExp(
            /^(https?:\/\/)(?:www\.)?([\d\w\-]+)(\.([\d\w\-]+))+$/
        );
        if (DOMAIN_PATTERN.test(url)) {
            url = url.replace(DOMAIN_PATTERN, '');
        }

        return url;
    }
}

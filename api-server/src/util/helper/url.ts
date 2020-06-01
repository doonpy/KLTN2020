/**
 * Remove domain from URL
 *
 * @param url
 */
export const sanitizeUrl = (url: string): string => {
    const DOMAIN_PATTERN = new RegExp(/^(https?:\/\/)(?:www\.)?([\d\w-]+)(\.([\d\w-]+))+$/);
    if (DOMAIN_PATTERN.test(url)) {
        url = url.replace(DOMAIN_PATTERN, '');
    }

    return url;
};

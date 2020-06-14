/**
 * Remove domain from URL
 */
export const sanitizeUrl = (url: string): string => {
    const DOMAIN_PATTERN = RegExp(
        /^(https?:\/\/)(?:www\.)?([\d\w-]+)(\.([\d\w-]+))+$/
    );
    let result = url;

    if (DOMAIN_PATTERN.test(url)) {
        result = url.replace(DOMAIN_PATTERN, '');
    }

    return result;
};

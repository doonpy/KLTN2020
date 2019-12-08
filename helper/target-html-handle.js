const cheerio = require("cheerio");

const HOST_DOMAIN_PATTERN = new RegExp(
    /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/,
    "g"
);
const VALID_DOMAIN = new RegExp(
    /(?:www\.)?([^:\/\n\?]+)(\.[\d\w\-]+)+\/?/,
    "g"
);
const VALID_PROTOCOL = new RegExp(/http(s)?:\/\//, "g");
const NAME_DEFINE = {
  class: {
    mouseHover: "pk-border-solid-hover pk-border-color-hover",
    mouseSelected: "pk-border-solid-selected pk-border-color-selected"
  },
  css: {
    borderHoverStyle: "pk-border-solid-hover",
    borderHoverColor: "pk-border-color-hover",
    borderSelectedStyle: "pk-border-solid-selected",
    borderSelectedColor: "pk-border-color-selected"
  }
};

/**
 * Customize css when hover and click event.
 * @param body
 */
exports.addCustomizeCSS = body => {
  // add mouse css
  $(body).append(
      `<style>
      .${NAME_DEFINE.css.borderSelectedStyle} { border: 1px solid #dee2e6 !important }
      .${NAME_DEFINE.css.borderSelectedColor} { border-color: #28a745!important }
      .${NAME_DEFINE.css.borderHoverStyle} { border: 0.5px solid #dee2e6 !important }
      .${NAME_DEFINE.css.borderHoverColor} { border-color: #dc3545!important }
    </style>`
  );
};

/**
 *
 * @param res
 * @param enableScript
 * @returns html
 */
exports.handleLinkFile = (res, enableScript) => {
  const $ = cheerio.load(res.body);
  const hostDomain = res.request.uri.href.match(HOST_DOMAIN_PATTERN);

  // Disable Js
  if (!enableScript) {
    $("script, iframe").remove();
  }

  // Edit css link
  $("link").each(function () {
    const $el = $(this);
    const href = $el.attr("href");
    if (href && !href.match(HOST_DOMAIN_PATTERN)) {
      $el.attr("href", `${hostDomain}${href}`);
    }
  });

  // Edit img, javascript link
  $("img, script").each(function () {
    const $el = $(this);
    const src = $el.attr("src");
    if (src && !src.match(HOST_DOMAIN_PATTERN)) {
      $el.attr("src", `${hostDomain}${src}`);
    }
  });

  return $.root().html();
};

/**
 * Validate domain
 * @param domain
 * @returns {boolean}
 */
exports.isValidDomain = domain => {
  return VALID_DOMAIN.test(domain);
};

/**
 * validate protocol
 * @param protocol
 * @returns {boolean}
 */
exports.isValidProtocol = protocol => {
  return VALID_PROTOCOL.test(protocol);
};

/**
 * validate target
 * @param target
 * @returns {boolean}
 */
exports.isValidTarget = target => {
  return HOST_DOMAIN_PATTERN.test(target);
};

/**
 * get domain from target
 * @param target
 * @returns {*}
 */
exports.getDomainFromTarget = target => {
  return target.match(VALID_DOMAIN)[0];
};

const targetHtmlHandle = require("../helper/target-html-handle");
const requestModule = require("../core/module/request");

/**
 * Handle GET request
 * @param req
 * @param res
 * @param next
 */
exports.getIndex = (req, res, next) => {
    let assigns = {
        title: "Home",
        breadcrumb: [
            {
                href: "/",
                pageName: "Home"
            }
        ]
    };
    res.render("index/view", assigns);
};

/**
 * Handle POST request
 * @param req
 * @param res
 * @param next
 */
exports.postIndex = (req, res, next) => {
    let protocol = req.body.protocol.trim();
    let domain = req.body.domain.trim();
    let assigns = {
        title: "Home",
        breadcrumb: [
            {
                href: "/",
                pageName: "Home"
            }
        ]
    };

    if (!targetHtmlHandle.isValidDomain(domain) || !targetHtmlHandle.isValidProtocol(protocol)) {
        assigns.error = `${protocol}${domain} - domain or protocol is invalid!`;
        res.render("index/view", assigns);
    } else {
        requestModule
            .send(`${protocol}${domain}`)
            .then(response => {
                res.redirect(`/catalog/add?target=${protocol}${domain}&enableScript=0`);
            })
            .catch(err => {
                assigns.error = `${protocol}${domain} - ${err.code}`;
                res.render("index/view", assigns);
            });
    }
};

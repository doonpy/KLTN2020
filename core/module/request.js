const request = require("request");
const DEFAULT_OPTION = {
    MAX_TIMEOUT: 1000 * 5
};

exports.send = url => {
    return new Promise((success, failed) => {
        const headers = {
            "User-Agent": "Googlebot/2.1 (+http://www.googlebot.com/bot.html)"
        };

        request(
            url,
            {time: true, timeout: DEFAULT_OPTION.MAX_TIMEOUT, headers: headers},
            function (error, response) {
                if (error) {
                    failed(error);
                } else {
                    success(response);
                }
            }
        );
    });
};

const request = require("request");
const DEFAULT_OPTION = {
    MAX_REQUEST_PER_CRAWL: 20,
    MAX_TIMEOUT: 1000 * 3,
    DEEPLIMIT: Number.MAX_SAFE_INTEGER // 1 is unlimited
};

const sendRequest = url => {
    return new Promise((success, failed) => {
        const headers = {
            "User-Agent": "Googlebot/2.1 (+http://www.googlebot.com/bot.html)"
        };

        request(
            url,
            {time: true, timeout: DEFAULT_OPTION.MAX_TIMEOUT, headers: headers},
            function (error, response) {
                if (error) {
                    console.log(`-> Request to ${url}`, `-`, `ERR: ${error.code}`);
                    failed(error);
                } else {
                    console.log(
                        `-> Request to ${response && response.request.uri.href}`,
                        `-`,
                        response && response.statusCode,
                        `-`,
                        `${response.elapsedTime}ms`
                    );
                    success(response);
                }
            }
        );
    });
};

const main = url => {
    sendRequest(url)
        .then(response => {
            process.send({err: null, response: response});
        })
        .catch(err => {
            process.send({err: err, response: url});
        });
};

process.on("message", data => {
    main(data.url);
});

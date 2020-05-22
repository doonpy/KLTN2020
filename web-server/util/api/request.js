import fetch from 'isomorphic-unfetch';

const METHOD = {
    GET: 'GET',
    HEAD: 'HEAD',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH',
    POST: 'POST',
};

const { API_URI } = process.env;

const request = {
    call: async (url, parameters) => {
        const baseURL = url.indexOf(API_URI) === 0 ? url : `${API_URI}${url}`;
        const response = await fetch(baseURL, parameters);
        return response;
    },
    parameters: (method = METHOD.GET, body = {}) => {
        // if Authen
        const withBody = [METHOD.PUT, METHOD.PATCH, METHOD.POST];
        const params = {
            method,
            headers: {
                // config header and authen
            },
        };

        if (withBody.indexOf(method) !== -1) {
            params.body = JSON.stringify(body);
            if (method === METHOD.PUT) {
                params.headers['Content-Length'] = 0;
            }
        }

        return params;
    },
    delete: async (url) => {
        const response = await request.call(url, request.parameters(METHOD.DELETE));

        return response;
    },
    get: async (url, body = {}) => {
        const response = await request.call(url, request.parameters(METHOD.GET, body));

        return response.json();
    },

    patch: async (url, body = {}) => {
        const response = await request.call(url, request.parameters(METHOD.PATCH, body));

        return response;
    },
    put: async (url, body = {}) => {
        const response = await request.call(url, request.parameters(METHOD.PUT, body));

        return response;
    },
};
export default request;

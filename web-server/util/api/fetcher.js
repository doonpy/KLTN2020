import request from './request';

export default async function fetcher(...args) {
    const res = await request.get(...args);
    return res;
}

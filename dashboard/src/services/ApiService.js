import axios from 'axios';

const API_SERVER =
    process.env.NODE_ENV === 'production'
        ? 'http://pk2020.tk:3000'
        : 'http://localhost:3000';

export const getApiServer = () => API_SERVER;

export const getData = async (endpoint, ...queries) => {
    const queryString = queries
        .map(({ key, value }) => `${key}=${value}`)
        .join('&');
    const { data } = await axios(
        `${API_SERVER}/api/v1/${endpoint}?${queryString}`
    );

    return data;
};

export const updateData = async (endpoint, body) => {
    const { data } = await axios.patch(
        `${API_SERVER}/api/v1/${endpoint}`,
        body
    );

    return data;
};

export const createData = async (endpoint, body) => {
    const { data } = await axios.post(`${API_SERVER}/api/v1/${endpoint}`, body);

    return data;
};

export const deleteData = async (endpoint) => {
    const { data } = await axios.delete(`${API_SERVER}/api/v1/${endpoint}`);

    return data;
};

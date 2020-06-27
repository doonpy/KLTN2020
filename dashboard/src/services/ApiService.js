import axios from 'axios';

const API_SERVER =
    process.env.NODE_ENV === 'production'
        ? 'http://pk2020.tk/api/v1'
        : 'http://localhost:3000/api/v1';

export const getData = async (endpoint, ...queries) => {
    const queryString = queries
        .map(({ key, value }) => `${key}=${value}`)
        .join('&');
    const { data } = await axios(`${API_SERVER}/${endpoint}?${queryString}`);

    return data;
};

export const updateData = async (endpoint, body) => {
    const { data } = await axios.patch(`${API_SERVER}/${endpoint}`, body);

    return data;
};

export const createData = async (endpoint, body) => {
    const { data } = await axios.post(`${API_SERVER}/${endpoint}`, body);

    return data;
};

export const deleteData = async (endpoint) => {
    const { data } = await axios.delete(`${API_SERVER}/${endpoint}`);

    return data;
};

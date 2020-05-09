/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/layout';
import * as action from '../store/raw-data/actions';

const Home = () => {
    // dispatch data redux
    const dispatch = useDispatch();

    // get state in redux

    // const getRawDataExample = () => {};
    useEffect(() => {
        dispatch(action.getRawRequest());
    }, []);
    const rawdatas = useSelector((state) => state.rawDatas);
    const { loading, rawDatas } = rawdatas;
    console.log('[raws]: ', rawDatas);
    return (
        <Layout>
            <div>Example</div>
        </Layout>
    );
};

export default Home;

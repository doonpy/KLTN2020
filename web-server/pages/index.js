/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/layout';
import * as action from '../store/raw-data/actions';

const Home = () => {
    // dispatch data redux

    return (
        <Layout>
            <div>Example</div>
        </Layout>
    );
};

export default Home;

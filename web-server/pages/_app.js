import React from 'react';
import App from 'next/app';
import { wrapper } from '../store/store';
import '../styles/global.css';

class MyApp extends App {
    // static async getInitialProps({ Component, ctx }) {
    //     return {
    //         pageProps: {
    //             // Call page-level getInitialProps
    //             ...(Component.getInitialProps ? await Component.getInitialProps(ctx) : {}),
    //         },
    //     };
    // }

    render() {
        const { Component, pageProps } = this.props;
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <Component {...pageProps} />;
    }
}

export default MyApp;

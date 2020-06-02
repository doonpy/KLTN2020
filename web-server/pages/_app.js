import React from 'react';
import Router from 'next/router';
import NProgress from 'nprogress';
import { wrapper } from '../store/store';
import '../styles/global.css';
import 'nprogress/nprogress.css';

NProgress.configure({
    minimum: 0.3,
    easing: 'ease',
    speed: 800,
    showSpinner: false,
});
Router.events.on('routeChangeStart', () => {
    NProgress.start();
});
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());
function MyApp({ Component, pageProps }) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Component {...pageProps} />;
}

export default wrapper.withRedux(MyApp);

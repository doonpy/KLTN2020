import React from 'react';
import Router from 'next/router';
import NProgress from 'nprogress';
import { wrapper } from '../store/store';
import * as action from '../store/count-document/actions';
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
MyApp.getInitialProps = async ({ Component, ctx }) => {
    await ctx.store.dispatch(action.getTotalRequest('raw-dataset'));
    return {
        pageProps: {
            // Call page-level getInitialProps
            ...(Component.getInitialProps ? await Component.getInitialProps(ctx) : {}),
        },
    };
};
export default wrapper.withRedux(MyApp);

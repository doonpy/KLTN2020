/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/react-in-jsx-scope */
// import App from 'next/app'

function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />;
}

export default MyApp;

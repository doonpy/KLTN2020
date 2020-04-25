/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/react-in-jsx-scope */
import App, { AppContext } from 'next/app';
import withRedux, { MakeStore } from 'next-redux-wrapper';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { createStore, Store, applyMiddleware } from 'redux';
import { RootState, rootReducer } from '../redux/store';
import '../styles/index.css';

/**
 * @param initialState The store's initial state (on the client side, the state of the server-side store is passed here)
 */

const makeStore: MakeStore = (initialState: RootState) => {
    return createStore(rootReducer, initialState, composeWithDevTools(applyMiddleware(thunkMiddleware)));
};
interface Props {
    store: Store;
}

class MyApp extends App<Props> {
    static async getInitialProps({ Component, ctx }: AppContext) {
        const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};

        return { pageProps };
    }

    render() {
        // eslint-disable-next-line no-shadow
        const { Component, pageProps, store } = this.props;

        return (
            // eslint-disable-next-line react/react-in-jsx-scope
            <Provider store={store}>
                <Component {...pageProps} />
            </Provider>
        );
    }
}

export default withRedux(makeStore)(MyApp);

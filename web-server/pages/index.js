/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import PageLayout from '../components/page-layout';
import PageMap from '../components/page-map';
import PageLeft from '../components/page-left';
import PageRight from '../components/page-right';
import { wrapper } from '../store/store';
import * as action from '../store/count-document/actions';

export const getServerSideProps = wrapper.getServerSideProps(async ({ store, req, res, ...etc }) => {
    await store.dispatch(action.getTotalRequest('raw-dataset'));
});
const Home = () => {
    return (
        <PageLayout>
            <main className="text-white" style={{ height: '90%' }}>
                <div className="w-full flex h-full">
                    <PageLeft />
                    <div className="w-8/12">
                        <div className="h-full flex flex-col">
                            <PageMap />
                        </div>
                    </div>
                    <PageRight />
                </div>
            </main>
        </PageLayout>
    );
};

export default wrapper.withRedux(Home);

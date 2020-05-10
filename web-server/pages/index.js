/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect } from 'react';
import PageLayout from '../components/page-layout';
import PageMap from '../components/page-map';
import PageLeft from '../components/page-left';
import PageRight from '../components/page-right';

const Home = () => {
    return (
        <PageLayout>
            <main className="text-white" style={{ height: '90%' }}>
                <div className="w-full flex h-full">
                    <PageLeft />
                    <div className="w-8/12">
                        <div className="h-full flex flex-col">
                            <PageMap />
                            {/* <div className="bg-gray-900 border border-solid border-primay" style={{ height: '25%' }}>
                                2
                            </div> */}
                        </div>
                    </div>
                    <PageRight />
                </div>
            </main>
        </PageLayout>
    );
};

export default Home;

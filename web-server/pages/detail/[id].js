import React from 'react';
import fetch from 'isomorphic-unfetch';
import Router from 'next/router';
import dynamic from 'next/dynamic';
import NProgress from 'nprogress';
import useRawDataDetail from '../../hooks/use-raw-data-detail';
import PageLayout from '../../components/page-layout';

const MapItem = dynamic(() => import('../../components/maps/MapItem'), {
    ssr: false,
});

NProgress.configure({
    minimum: 0.3,
    easing: 'ease',
    speed: 800,
    showSpinner: true,
});
Router.events.on('routeChangeStart', () => {
    NProgress.start();
});
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const DetailRealEstate = ({ id, initialData }) => {
    const { data } = useRawDataDetail(id, initialData);
    // const url = data.rawData.detailUrl.catalog.host.domain;

    return (
        <PageLayout>
            <div className="m-0 m-auto max-w-screen-xl pt-12">
                <div
                    className="text-white w-full flex"
                    style={{ height: 'calc(100vh - 100px)' }}
                >
                    <div className="w-1/2">
                        <div>
                            <h1 className="uppercase font-semibold text-xl">
                                {data.rawData.title}
                            </h1>
                            <div className="flex">
                                <span className="text-blue-600">Địa chỉ: </span>
                                <p className="pl-2">{data.rawData.address}</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-1/2">
                        <MapItem
                            position={[
                                data.rawData.coordinate.lat,
                                data.rawData.coordinate.lng,
                            ]}
                        />
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};
export async function getServerSideProps({ query }) {
    const res = await fetch(
        `http://localhost:3000/api/v1/vi/raw-data/${query.id}?populate=1`
    );
    const data = await res.json();
    return {
        props: { initialData: data, id: query.id }, // will be passed to the page component as props
    };
}
export default DetailRealEstate;

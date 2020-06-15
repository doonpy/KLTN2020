import React from 'react';
import fetch from 'isomorphic-unfetch';
import Router from 'next/router';
import dynamic from 'next/dynamic';
import moment from 'moment';
import NProgress from 'nprogress';
import { numberWithCommas } from '../../util/services/helper';
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
    return (
        <PageLayout>
            <div
                className="m-0 m-auto max-w-screen-xl pt-12"
                style={{ height: 'calc(100vh - 100px)' }}
            >
                <h1 className="uppercase font-semibold text-xl text-blue-400 text-3xl">
                    {data.rawData.title}
                </h1>
                <div className="text-white w-full flex">
                    <div className="w-1/2 mr-6">
                        <div>
                            <div className="flex">
                                <span className="text-blue-600 font-bold">
                                    Địa chỉ:
                                </span>
                                <p className="pl-2">{data.rawData.address}</p>
                            </div>
                            <div className="flex">
                                <span className="text-blue-600 font-bold">
                                    Giá:
                                </span>
                                <p className="pl-1">
                                    {numberWithCommas(data.rawData.price.value)}
                                    <span className="uppercase pl-2">
                                        {data.rawData.price.currency}
                                    </span>
                                </p>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-blue-600 font-bold">
                                    Miêu tả:
                                </span>
                                <p className="pl-2">{data.rawData.describe}</p>
                            </div>
                            <div className="flex">
                                <span className="text-blue-600 font-bold">
                                    Ngày cập nhật:
                                </span>
                                <p className="pl-2">
                                    {moment(data.rawData.updateAt)
                                        .locale('vi')
                                        .format('LLL')}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="w-1/2">
                        <span className="text-blue-600 font-bold mb-2">
                            Vị trí:
                        </span>
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
        `${process.env.API_URI}/api/v1/vi/raw-data/${query.id}?populate=1`
    );
    const data = await res.json();
    return {
        props: { initialData: data, id: query.id }, // will be passed to the page component as props
    };
}
export default DetailRealEstate;

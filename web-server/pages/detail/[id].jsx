import React from 'react';
import Router, { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import moment from 'moment';
import PropTypes from 'prop-types';
import NProgress from 'nprogress';
import Head from 'next/head';
import { numberWithCommas } from '../../util/services/helper';
import useRawDataDetail from '../../hooks/use-raw-data-detail';
import PageLayout from '../../components/page-layout';
import Loading from '../../components/Loading';

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

const Tag = ({ value, className }) => (
    <div className={`tag uppercase text-xs ${className}`}>{value}</div>
);
Tag.propTypes = {
    value: PropTypes.string,
    className: PropTypes.string,
};
const DetailRealEstate = () => {
    const router = useRouter();

    const { id } = router.query;

    const { data, isValidating } = useRawDataDetail(id);

    return (
        <>
            <style jsx>{`
                .txt-primary {
                    color: #101425;
                }
                .txt-paragraph {
                    color: #666;
                }
            `}</style>
            {data && !isValidating ? (
                <PageLayout>
                    <Head>
                        <title>
                            {`Trang chi tiết: ${data.rawData?.title}`}
                        </title>
                        <meta
                            name="viewport"
                            content="initial-scale=1.0, width=device-width"
                        />
                    </Head>
                    <div style={{ paddingTop: '100px' }}>
                        <div
                            className="w-full m-0 p-0 bg-cover bg-bottom"
                            style={{
                                backgroundImage: 'url("/images/banner.jpg")',
                                height: '60vh',
                                maxHeight: '460px',
                            }}
                        />
                        <div
                            className=" px-4 py-12 md:px-0  max-w-screen-xl mx-auto -mt-32 rounded overflow-hidden shadow-lg"
                            style={{ background: '#fff' }}
                        >
                            <div className="mx-0 sm:mx-6">
                                <div className="bg-gray-200 w-full leading-normal rounded-t">
                                    <div
                                        className="flex h-full flex-col"
                                        style={{ background: '#fff' }}
                                    >
                                        <h1 className="uppercase text-center font-semibold txt-primary text-3xl w-full pt-4 pb-8">
                                            {data.rawData?.title}
                                        </h1>
                                        <div className="text-white w-full flex">
                                            <div className="w-1/2 mr-6">
                                                <div>
                                                    {data.rawData
                                                        ?.transactionType && (
                                                        <Tag
                                                            className="bg-red-700"
                                                            value={
                                                                data.rawData
                                                                    .transactionType
                                                                    .wording[0]
                                                            }
                                                        />
                                                    )}
                                                    {data.rawData
                                                        ?.propertyType && (
                                                        <Tag
                                                            className="bg-blue-500"
                                                            value={
                                                                data.rawData
                                                                    ?.propertyType
                                                                    ?.wording[0]
                                                            }
                                                        />
                                                    )}

                                                    <div className="flex pt-2">
                                                        <span className="txt-primary font-bold">
                                                            Địa chỉ:
                                                        </span>
                                                        <p className="pl-8 txt-paragraph">
                                                            {
                                                                data.rawData
                                                                    .address
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="flex pt-2">
                                                        <span className="txt-primary font-bold">
                                                            Diện tích:
                                                        </span>
                                                        <p className="pl-8 txt-paragraph">
                                                            {`${numberWithCommas(
                                                                data.rawData
                                                                    .acreage
                                                                    ?.value
                                                            )} ${
                                                                data.rawData
                                                                    .acreage
                                                                    ?.measureUnit
                                                            }`}
                                                        </p>
                                                    </div>
                                                    <div className="flex py-2">
                                                        <span className="txt-primary font-bold">
                                                            Giá:
                                                        </span>
                                                        <p className="pl-8 txt-paragraph">
                                                            {numberWithCommas(
                                                                data.rawData
                                                                    .price.value
                                                            )}
                                                            <span className="uppercase pl-1">
                                                                {
                                                                    data.rawData
                                                                        .price
                                                                        .currency
                                                                }
                                                            </span>
                                                            <span>
                                                                {data.rawData
                                                                    .price
                                                                    ?.timeUnit &&
                                                                    `/${data.rawData.price?.timeUnit?.wording[0]}`}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col pt-2">
                                                        <span className="txt-primary font-bold">
                                                            Thông tin mô tả:
                                                        </span>
                                                        <p className="txt-paragraph">
                                                            {
                                                                data.rawData
                                                                    .describe
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="flex py-2">
                                                        <span className="txt-primary font-bold">
                                                            Ngày cập nhật:
                                                        </span>
                                                        <p className="pl-8  txt-paragraph ">
                                                            {moment(
                                                                data.rawData
                                                                    .updateAt
                                                            )
                                                                .locale('vi')
                                                                .format('LLL')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-1/2">
                                                <div className="rounded shadow p-2">
                                                    <div className="py-2 w-full text-center txt-primary font-bold">
                                                        Bản đồ
                                                    </div>
                                                    <MapItem
                                                        position={[
                                                            data.rawData
                                                                .coordinate.lat,
                                                            data.rawData
                                                                .coordinate.lng,
                                                        ]}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="py-4" />
                    </div>
                </PageLayout>
            ) : (
                <div className="w-full h-screen bg-gray-900 max-h-screen">
                    <div className="flex justify-center items-center h-full">
                        <Loading />
                    </div>
                </div>
            )}
        </>
    );
};
export default DetailRealEstate;

import React, { useState } from 'react';
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Loading from '../components/Loading';
import PageLayout from '../components/page-layout';
import PageMap from '../components/page-map';
import PageLeft from '../components/page-left';
import PageRight from '../components/page-right';
import useDistrict from '../hooks/use-district';
import useWard from '../hooks/use-ward';
import { useMedia } from '../hooks/use-media';
import { TRANSATION_TYPE, MAP_MODE, MAP_KEY_HCM } from '../util/constants';

export async function getStaticProps() {
    const postsDirectory = path.join(
        process.cwd(),
        '/web-server/api/geojson/hcm'
    );
    const filenames = fs.readdirSync(postsDirectory);

    const fullGEO = filenames.map((filename) => {
        const filePath = path.join(postsDirectory, filename);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return {
            filename: filename.replace('.geo.json', ''),
            content: JSON.parse(fileContents),
        };
    });
    return {
        props: { mapStaticJSON: fullGEO },
    };
}

const Home = ({ mapStaticJSON }) => {
    const [transactionStage, setTransaction] = useState(TRANSATION_TYPE.TOTAL);

    const { data: dataDistrict } = useDistrict();
    const { data: dataWard } = useWard();

    const { mapKey } = useSelector((state) => state.mapKey);
    const { modeMap } = useSelector((state) => state.modeMap);

    const summaryData = (key, tabKey) => {
        if (!summaryData.cache) {
            summaryData.cache = {};
        }
        const _key = `${key}_${tabKey}`;
        const _synmetricKey = `${tabKey}_${key}`;
        if (summaryData.cache[_key]) return summaryData.cache[_key];
        if (summaryData.cache[_synmetricKey])
            return summaryData.cache[_synmetricKey];

        if (key !== MAP_KEY_HCM) {
            const dataWardFilter = dataWard?.summaryDistrictWard.filter(
                (w) => w.district.code === key
            );
            const dataSummaryWard =
                dataWardFilter &&
                dataWardFilter.map((w) => {
                    const summary =
                        tabKey !== 0
                            ? w.summary.filter(
                                  (sum) => sum.transactionType === tabKey
                              )
                            : w.summary;
                    return {
                        name: w.ward.name,
                        code: w.ward.code,
                        summaryAmount: summary.reduce(
                            (sum, p) => sum + p.amount,
                            0
                        ),
                        acreage: 1,
                        summary,
                    };
                });
            summaryData.cache[_key] = dataSummaryWard;
            summaryData.cache[_synmetricKey] = dataSummaryWard;
            return dataSummaryWard;
        }
        const dataSummaryDistrict = dataDistrict?.summaryDistrict?.map((w) => {
            const summary =
                tabKey !== 0
                    ? w.summary.filter((sum) => sum.transactionType === tabKey)
                    : w.summary;
            return {
                name: w.district.name,
                drilldown: w.district.code,
                code: w.district.code,
                summaryAmount: summary.reduce((sum, p) => sum + p.amount, 0),
                acreage: w.district.acreage,
                summary,
            };
        });
        summaryData.cache[_key] = dataSummaryDistrict;
        summaryData.cache[_synmetricKey] = dataSummaryDistrict;
        return dataSummaryDistrict;
    };

    return (
        <>
            {dataDistrict && dataWard ? (
                <PageLayout>
                    <Head>
                        <title>Trang chủ</title>
                        <meta
                            name="viewport"
                            content="initial-scale=1.0, width=device-width"
                        />
                    </Head>
                    <main
                        className="dark:text-white text-light font-medium block"
                        style={{
                            height: '100vh',
                            paddingTop: '100px',
                        }}
                    >
                        <div className="w-full flex h-full">
                            <PageLeft />
                            <div className="w-full flex">
                                <div
                                    className={`${
                                        modeMap === MAP_MODE.DENSITY_MODE
                                            ? 'w-7/12'
                                            : 'w-full'
                                    } h-full`}
                                >
                                    <div
                                        className="h-full flex flex-col"
                                        style={{
                                            height: 'calc(100vh - 100px)',
                                        }}
                                    >
                                        <PageMap
                                            mapStaticJSON={mapStaticJSON}
                                            transactionStage={transactionStage}
                                            dataSummary={summaryData(
                                                mapKey,
                                                transactionStage
                                            )}
                                            setTransaction={setTransaction}
                                        />
                                    </div>
                                </div>
                                {modeMap === MAP_MODE.DENSITY_MODE ? (
                                    <PageRight
                                        dataSummary={summaryData(
                                            mapKey,
                                            transactionStage
                                        )}
                                        transactionStage={transactionStage}
                                        setTransaction={setTransaction}
                                    />
                                ) : null}
                            </div>
                        </div>
                    </main>
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

Home.propTypes = {
    mapStaticJSON: PropTypes.arrayOf(PropTypes.any).isRequired,
};
export default Home;

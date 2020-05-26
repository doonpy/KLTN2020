/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState } from 'react';
import fs from 'fs';
import path from 'path';
import { useSelector } from 'react-redux';
import Loading from '../components/Loading';
import PageLayout from '../components/page-layout';
import PageMap from '../components/page-map';
import PageLeft from '../components/page-left';
import PageRight from '../components/page-right';
import useDistrict from '../hooks/use-district';
import useWard from '../hooks/use-ward';

export async function getStaticProps() {
    const postsDirectory = path.join(process.cwd(), '/web-server/api/geojson/hcm');
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

/**
 * @param {number} tabs 0: Sale , 1: Rent, 2: Total
 * @param {string} mapKey vn-hcm_cuchi, ...
 */

const Home = ({ mapStaticJSON }) => {
    const [tabs, setTabs] = useState(2);

    const { data: dataDistrict } = useDistrict();
    const { data: dataWard } = useWard();
    const { mapKey } = useSelector((state) => state.mapKey);
    console.log(mapKey);
    const summaryData = (key, tabKey) => {
        if (!summaryData.cache) {
            summaryData.cache = {};
        }
        const _key = `${key}_${tabKey}`;
        const _synmetricKey = `${tabKey}_${key}`;
        if (key !== 'full') {
            const dataWardFilter = dataWard.summaryDistrictWard.filter((w) => w.district.code === key);
            const dataSummaryWard = dataWardFilter.map((w) => {
                const summary = tabKey !== 2 ? w.summary.filter((sum) => sum.transactionType === tabKey) : w.summary;

                return {
                    name: w.ward.name,
                    code: w.ward.code,
                    summaryAmount: summary.reduce((sum, p) => sum + p.amount, 0),
                    acreage: 1,
                    summary,
                };
            });
            return dataSummaryWard;
        }
        const dataSummaryDistrict = dataDistrict.summaryDistrict.map((w) => {
            const summary = tabKey !== 2 ? w.summary.filter((sum) => sum.transactionType === tabKey) : w.summary;
            return {
                name: w.district.name,
                drilldown: w.district.code,
                code: w.district.code,
                summaryAmount: summary.reduce((sum, p) => sum + p.amount, 0),
                acreage: w.district.acreage,
                summary,
            };
        });
        return dataSummaryDistrict;
    };

    return (
        <PageLayout>
            {dataDistrict && dataWard ? (
                <main className="text-white block" style={{ height: 'calc(100vh - 100px)' }}>
                    <div className="w-full flex h-full">
                        <PageLeft />
                        <div className="w-full flex">
                            <div className="w-9/12 h-full">
                                <div className="h-full flex flex-col">
                                    <PageMap mapStaticJSON={mapStaticJSON} dataSummary={summaryData(mapKey, tabs)} />
                                </div>
                            </div>
                            <PageRight dataSummary={summaryData(mapKey, tabs)} tabs={tabs} setTabs={setTabs} />
                        </div>
                    </div>
                </main>
            ) : (
                <div className="w-full" style={{ height: 'calc(100vh - 100px)' }}>
                    <div className="flex justify-center items-center h-full">
                        <Loading />
                    </div>
                </div>
            )}
        </PageLayout>
    );
};

export default Home;

/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import fs from 'fs';
import path from 'path';
import PageLayout from '../components/page-layout';
import PageMap from '../components/page-map';
import PageLeft from '../components/page-left';
import PageRight from '../components/page-right';

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
        props: { mapCollection: fullGEO },
    };
}

const Home = ({ mapCollection }) => {
    return (
        <PageLayout>
            <main className="text-white block" style={{ height: 'calc(100vh - 100px)' }}>
                <div className="w-full flex h-full">
                    <PageLeft />
                    <div className="w-full flex">
                        <div className="w-9/12 h-full">
                            <div className="h-full flex flex-col">
                                <PageMap mapCollection={mapCollection} />
                            </div>
                        </div>
                        <PageRight />
                    </div>
                </div>
            </main>
        </PageLayout>
    );
};

export default Home;

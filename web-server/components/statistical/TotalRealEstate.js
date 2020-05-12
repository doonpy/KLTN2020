import React from 'react';
import fetch from 'isomorphic-unfetch';
import useSWR from 'swr';
import fetcher from '../../util/api/fetcher';

const TotalRealEstate = (props) => {
    const { isValidating, data, error } = useSWR('/api/v1/vi/catalogs', fetcher);
    return (
        <div className="m-0 m-auto bg-gray-900 border border-primay border-solid mt-4 h-32" style={{ maxWidth: '90%' }}>
            <div> sdas</div>
        </div>
    );
};

export async function getServerSideProps() {
    const data = await fetcher('/api/v1/vi/catalogs');
    return { props: { initialData: data } };
}
export default TotalRealEstate;

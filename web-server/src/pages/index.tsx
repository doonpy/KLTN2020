import React from 'react';
import RawDataApiLogic from '../service/api/raw-data/api.raw-data.logic';
import TransactionTypeChart from '../component/chart/chart.transaction-type';

export async function getServerSideProps() {
    const transactionTypes: number[] = [0, 1];
    const propertyTypes: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const documentAmountArray: object[][] = [];
    for (const transactionType of transactionTypes) {
        for (const propertyType of propertyTypes) {
            const documentAmount: number = await RawDataApiLogic.countDocumentsWithConditions(
                transactionType,
                propertyType
            );

            if (!documentAmountArray[transactionType]) {
                documentAmountArray[transactionType] = [];
            }
            documentAmountArray[transactionType].push({ [propertyType]: documentAmount });
        }
    }

    return { props: { documentAmountArray } };
}

const Home = ({ documentAmountArray }: { documentAmountArray: { [key: string]: number }[][] }): JSX.Element => {
    const saleSummaryAmount: number = documentAmountArray[0].reduce((sum, item, index): number => sum + item[index], 0);
    const rentSummaryAmount: number = documentAmountArray[1].reduce((sum, item, index): number => sum + item[index], 0);
    console.log(saleSummaryAmount, rentSummaryAmount);
    const PROPERTY_TYPE = [
        ['căn hộ chung cư', 'apartments'],
        ['nhà riêng', 'individual houses'],
        ['biệt thự', 'villas'],
        ['nhà mặt phố', 'townhouses'],
        ['đất nền dự án', 'project lands'],
        ['đất', 'lands'],
        ['trang trại, khu nghỉ dưỡng', 'farms, resorts'],
        ['nhà kho', 'warehouse'],
        ['nhà trọ, phòng trọ', 'rooms'],
        ['văn phòng', 'offices'],
        ['cửa hàng', 'shops'],
        ['các loại bất động sản khác', 'others'],
    ];

    return (
        <div style={{ width: 100, height: 100 }}>
            <TransactionTypeChart
                name={'test'}
                data={[
                    {
                        name: 'Sale',
                        y: (saleSummaryAmount / (saleSummaryAmount + rentSummaryAmount)) * 100,
                        drilldown: 'Sale',
                    },
                    {
                        name: 'Rent',
                        y: (rentSummaryAmount / (saleSummaryAmount + rentSummaryAmount)) * 100,
                        drilldown: 'Sale',
                    },
                ]}
                drilldown={[
                    {
                        name: 'Sale',
                        id: 'Sale',
                        data: documentAmountArray[0].map((item, index) => [
                            PROPERTY_TYPE[index][0],
                            (item[index] / saleSummaryAmount) * 100,
                        ]),
                    },
                    {
                        name: 'Rent',
                        id: 'Rent',
                        data: documentAmountArray[1].map((item, index) => [
                            PROPERTY_TYPE[index][0],
                            (item[index] / rentSummaryAmount) * 100,
                        ]),
                    },
                ]}
            />
        </div>
    );
};

export default Home;

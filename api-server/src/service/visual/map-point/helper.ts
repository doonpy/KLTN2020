/**
 * Return aggregation query for get all
 */
export const getAggregationForGetAll = (
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
    minAcreage: number,
    maxAcreage: number,
    minPrice: number,
    maxPrice: number,
    transactionTypeAndPropertyTypeAggregations: object
) => {
    return [
        // Filter by lat long
        {
            $match: {
                $and: [
                    {
                        lat: {
                            $gte: minLat,
                        },
                    },
                    {
                        lat: {
                            $lte: maxLat,
                        },
                    },
                    {
                        lng: {
                            $gte: minLng,
                        },
                    },
                    {
                        lng: {
                            $lte: maxLng,
                        },
                    },
                ],
            },
        },
        // Filter by transaction type and property type
        {
            $project: {
                districtId: 1,
                wardId: 1,
                lat: 1,
                lng: 1,
                points: {
                    $filter: {
                        input: '$points',
                        as: 'point',
                        cond: transactionTypeAndPropertyTypeAggregations,
                    },
                },
                cTime: 1,
                mTime: 1,
            },
        },
        // Filter by acreage and price
        {
            $project: {
                districtId: 1,
                wardId: 1,
                lat: 1,
                lng: 1,
                points: {
                    $map: {
                        input: '$points',
                        as: 'point',
                        in: {
                            rawDataset: {
                                $filter: {
                                    input: '$$point.rawDataset',
                                    as: 'rawData',
                                    cond: {
                                        $and: [
                                            {
                                                $gte: [
                                                    '$$rawData.acreage',
                                                    minAcreage,
                                                ],
                                            },
                                            {
                                                $lte: [
                                                    '$$rawData.acreage',
                                                    maxAcreage,
                                                ],
                                            },
                                            {
                                                $gte: [
                                                    '$$rawData.price',
                                                    minPrice,
                                                ],
                                            },
                                            {
                                                $lte: [
                                                    '$$rawData.price',
                                                    maxPrice,
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                            transactionType: '$$point.transactionType',
                            propertyType: '$$point.propertyType',
                        },
                    },
                },
                cTime: 1,
                mTime: 1,
            },
        },
        // Remove element which has rawDataset is empty
        {
            $project: {
                districtId: 1,
                wardId: 1,
                lat: 1,
                lng: 1,
                points: {
                    $filter: {
                        input: '$points',
                        as: 'point',
                        cond: {
                            $gt: [
                                {
                                    $size: '$$point.rawDataset',
                                },
                                0,
                            ],
                        },
                    },
                },
                cTime: 1,
                mTime: 1,
            },
        },
        // Count points element and set isEmpty flag
        {
            $project: {
                districtId: 1,
                wardId: 1,
                lat: 1,
                lng: 1,
                points: {
                    $filter: {
                        input: '$points',
                        as: 'point',
                        cond: {
                            $gt: [
                                {
                                    $size: '$$point.rawDataset',
                                },
                                0,
                            ],
                        },
                    },
                },
                isEmpty: {
                    $eq: [
                        {
                            $size: '$points',
                        },
                        0,
                    ],
                },
                cTime: 1,
                mTime: 1,
            },
        },
        // Filter by isEmpty flag
        {
            $match: {
                isEmpty: {
                    $eq: false,
                },
            },
        },
    ];
};

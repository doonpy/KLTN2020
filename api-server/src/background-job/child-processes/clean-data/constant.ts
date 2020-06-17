export const CleanDataConstant = {
    DUPLICATE_DETAIL_URL_AGGREGATIONS: [
        {
            $group: {
                _id: '$url',
                docList: {
                    $push: '$$ROOT',
                },
            },
        },
        {
            $project: {
                docList: 1,
                isNotSingle: {
                    $gt: [
                        {
                            $size: '$docList',
                        },
                        1,
                    ],
                },
            },
        },
        {
            $match: {
                isNotSingle: true,
            },
        },
    ],
};

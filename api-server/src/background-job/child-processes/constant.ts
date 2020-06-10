export const GroupedDataConstant = {
    MESSAGE_TYPE: {
        START: 0,
        SUSPENSE: 1,
        CONTINUE: 2,
        IS_SUSPENSE: 3,
        STOP: 4,
    },
};

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

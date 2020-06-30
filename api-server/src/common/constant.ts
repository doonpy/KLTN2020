const CommonConstant = {
    TRANSACTION_TYPE: [
        { id: 1, wording: ['bán', 'sale'] },
        { id: 2, wording: ['thuê', 'rent'] },
    ],
    PROPERTY_TYPE: [
        {
            id: 1,
            wording: ['căn hộ, chung cư', 'apartment'],
        },
        {
            id: 2,
            wording: ['nhà, nhà riêng, nhà nguyên căn', 'individual house'],
        },
        {
            id: 3,
            wording: ['biệt thự, nhà liền kề', 'villa'],
        },
        {
            id: 4,
            wording: ['nhà mặt tiền, nhà mặt phố, nhà phố', 'townhouse'],
        },
        {
            id: 5,
            wording: ['đất nền dự án', 'project land'],
        },
        {
            id: 6,
            wording: ['đất', 'land'],
        },
        {
            id: 7,
            wording: ['trang trại, khu nghỉ dưỡng', 'farm, resort'],
        },
        {
            id: 8,
            wording: ['kho, nhà xưởng', 'warehouse, factory'],
        },
        {
            id: 9,
            wording: ['nhà trọ, phòng trọ', 'room'],
        },
        {
            id: 10,
            wording: ['văn phòng, mặt bằng', 'office, ground'],
        },
        {
            id: 11,
            wording: ['cửa hàng, bán lẻ, ki ốt', 'shop'],
        },
        {
            id: 12,
            wording: ['nhà hàng, khách sạn, nhà nghỉ', 'restaurant, hotel'],
        },
    ],
    PRICE_TIME_UNIT: [
        {
            id: 1,
            wording: ['tháng', 'month'],
        },
        {
            id: 2,
            wording: ['năm', 'year'],
        },
        {
            id: 3,
            wording: ['ngày', 'day'],
        },
    ],
    PRICE_CURRENCY: [
        {
            id: 1,
            wording: 'vnd',
        },
        {
            id: 2,
            wording: 'usd',
        },
    ],
    MIN_ID: 1,
    REVIEW_FOLDER_PATH: '/review',
};

export default CommonConstant;

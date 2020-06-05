export const PROPERTY_TYPE_NUMBER = [
    {
        id: 0,
        wording: ['Tổng hợp', 'Total RealEstate'],
    },
    {
        id: 1,
        wording: ['Căn hộ, chung cư', 'apartment'],
    },
    {
        id: 2,
        wording: ['Nhà, nhà riêng, nhà nguyên căn', 'individual house'],
    },
    {
        id: 3,
        wording: ['Biệt thự, nhà liền kề', 'villa'],
    },
    {
        id: 4,
        wording: ['Nhà mặt tiền, nhà mặt phố, nhà phố', 'townhouse'],
    },
    {
        id: 5,
        wording: ['Đất nền dự án', 'project land'],
    },
    {
        id: 6,
        wording: ['Đất', 'land'],
    },
    {
        id: 7,
        wording: ['Trang trại, khu nghỉ dưỡng', 'farm, resort'],
    },
    {
        id: 8,
        wording: ['Kho, nhà xưởng', 'warehouse, factory'],
    },
    {
        id: 9,
        wording: ['Nhà trọ, phòng trọ', 'room'],
    },
    {
        id: 10,
        wording: ['Văn phòng, mặt bằng', 'office, ground'],
    },
    {
        id: 11,
        wording: ['Cửa hàng, bán lẻ, ki ốt', 'shop'],
    },
    {
        id: 12,
        wording: ['Nhà hàng, khách sạn, nhà nghỉ', 'restaurant, hotel'],
    },
];
export const MODEL_URL = {
    RAWDATA: 'raw-dataset',
    HOSTS: 'hosts',
    CATALOGS: 'catalogs',
    GROUPED_DATA: 'grouped-dataset',
};

export const TRANSATION_TYPE = {
    TOTAL: 0,
    SALE: 1,
    RENT: 2,
};
export const ACREAGE_BY_ZOOM_LEVEL = [
    {
        zoom: 10,
        minArea: 50000,
        maxArea: 200000,
    },
    {
        zoom: 11,
        minArea: 5000,
        maxArea: 49999,
    },
    {
        zoom: 12,
        minArea: 1000,
        maxArea: 5000,
    },
    {
        zoom: 13,
        minArea: 1000,
        maxArea: 200000,
    },
    {
        zoom: 14,
        minArea: 1000,
        maxArea: 200000,
    },
    {
        zoom: 14,
        minArea: 1,
        maxArea: 500,
    },
    {
        zoom: 15,
        minArea: 1,
        maxArea: 500,
    },
    {
        zoom: 16,
        minArea: 1,
        maxArea: 500,
    },
    {
        zoom: 17,
        minArea: 1,
        maxArea: 500,
    },
    {
        zoom: 18,
        minArea: 1,
        maxArea: 500,
    },
];

export const MAP_MODE = {
    AREA_MODE: 'Xem Diện tích',
    PRICE_MODE: 'Xem Giá',
    DENSITY_MODE: 'Xem mật độ',
    POSITION_MODE: 'Xem vị trí',
};

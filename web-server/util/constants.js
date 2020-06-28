export const AREA_LEGEND = [0, 50, 100, 500, 1000, 5000, 10000, 50000, 100000];
export const PRICE_LEGEND = [0, 0.5, 1, 5, 10, 50, 100, 500, 1000, 5000];

export const COLOR_CODE = [
    '#85929E',
    '#CCD1D1',
    '#CA6F1E',
    '#7D6608',
    '#40C8F6',
    '#633974 ',
    'green',
    '#2980B9',
    '#154360',
    'red',
];
export const UNIT_OF_MEASURE = {
    SQUARE_METER: 'm²',
    VND: 'VND',
};
export const PROPERTY_TYPE_NUMBER = [
    {
        id: 0,
        wording: ['Tổng hợp', 'Total RealEstate'],
        img: '/images/property/chung.jpg',
    },
    {
        id: 1,
        wording: ['Căn hộ, chung cư', 'apartment'],
        img: '/images/property/chung_cu.jpg',
    },
    {
        id: 2,
        wording: ['Nhà, nhà riêng, nhà nguyên căn', 'individual house'],
        img: '/images/property/nha_rieng.jpg',
    },
    {
        id: 3,
        wording: ['Biệt thự, nhà liền kề', 'villa'],
        img: '/images/property/biet_thu.jpg',
    },
    {
        id: 4,
        wording: ['Nhà mặt tiền, nhà mặt phố, nhà phố', 'townhouse'],
        img: '/images/property/nhamatien.jpg',
    },
    {
        id: 5,
        wording: ['Đất nền dự án', 'project land'],
        img: '/images/property/dat_nen_du_an.jpg',
    },
    {
        id: 6,
        wording: ['Đất', 'land'],
        img: '/images/property/dat.jpg',
    },
    {
        id: 7,
        wording: ['Trang trại, khu nghỉ dưỡng', 'farm, resort'],
        img: '/images/property/khu_du_lich.jpg',
    },
    {
        id: 8,
        wording: ['Kho, nhà xưởng', 'warehouse, factory'],
        img: '/images/property/kho_xuong.jpg',
    },
    {
        id: 9,
        wording: ['Nhà trọ, phòng trọ', 'room'],
        img: '/images/property/nha_tro.jpg',
    },
    {
        id: 10,
        wording: ['Văn phòng, mặt bằng', 'office, ground'],
        img: '/images/property/van_phong.jpg',
    },
    {
        id: 11,
        wording: ['Cửa hàng, bán lẻ, ki ốt', 'shop'],
        img: '/images/property/cua_hang.jpg',
    },
    {
        id: 12,
        wording: ['Nhà hàng, khách sạn, nhà nghỉ', 'restaurant, hotel'],
        img: '/images/property/khach_san.jpg',
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
export const ZOOM_LEVEL = [
    {
        zoom: 10,
        minArea: 50000,
        minPrice: 5000000000000,
    },
    {
        zoom: 11,
        minArea: 10000,
        minPrice: 1000000000000,
    },
    {
        zoom: 12,
        minArea: 5000,
        minPrice: 500000000000,
    },
    {
        zoom: 13,
        minArea: 1000,
        minPrice: 100000000000,
    },
    {
        zoom: 14,
        minArea: 800,
        minPrice: 50000000000,
    },
    {
        zoom: 14,
        minArea: 500,
        minPrice: 30000000000,
    },
    {
        zoom: 15,
        minArea: 100,
        minPrice: 10000000000,
    },
    {
        zoom: 16,
        minArea: 1,
        minPrice: 5000000000,
    },
    {
        zoom: 17,
        minArea: 1,
        minPrice: 1000000000,
    },
    {
        zoom: 18,
        minArea: 1,
        minPrice: 1,
    },
];

export const MAP_MODE = {
    AREA_MODE: 'diện tích',
    PRICE_MODE: 'giá',
    DENSITY_MODE: 'mật độ',
    POSITION_MODE: 'vị trí',
};

export const MAP_KEY_HCM = 'full';

export const TRANSATION_SELECT = [
    {
        id: 0,
        type: 'Tổng hợp',
    },
    {
        id: 1,
        type: 'Bán',
    },
    {
        id: 2,
        type: 'Thuê',
    },
];
export const TIME_SELECT = [
    {
        value: 6,
        time: '6 tháng',
    },
    {
        value: 12,
        time: '1 năm',
    },
    {
        value: 24,
        time: '2 năm',
    },
];

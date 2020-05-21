export interface HereMapGeocodeResponse {
    items: {
        title: string;
        id: string;
        resultType: 'houseNumber' | 'addressBlock' | 'street' | 'locality' | 'administrativeArea' | 'place';
        houseNumberType: 'PA' | 'interpolated';
        addressBlockType: 'block' | 'subblock';
        localityType: 'postalCode' | 'subdistrict' | 'district' | 'city';
        administrativeAreaType: 'county' | 'state' | 'country';
        address: {
            label: string;
            countryCode: string;
            countryName: string;
            state: string;
            county: string;
            city: string;
            district: string;
            subdistrict: string;
            street: string;
            block: string;
            subblock: string;
            postalCode: string;
            houseNumber: string;
        };
        position: {
            lat: number;
            lng: number;
        };
        access: [
            {
                lat: number;
                lng: number;
            }
        ];
        distance: number;
        mapView: {
            west: number;
            south: number;
            east: number;
            north: number;
        };
        categories: [
            {
                id: string;
            }
        ];
        foodTypes: [
            {
                id: string;
            }
        ];
        houseNumberFallback: true;
    }[];
    status?: number;
    title?: string;
    code?: string;
    cause?: string;
    action?: string;
    correlationId?: string;
    requestId?: string;
}

export interface BingMapGeocodeResponse {
    authenticationResultCode: string;
    brandLogoUri: string;
    copyright: string;
    resourceSets: {
        estimatedTotal: number;
        resources: {
            __type: string;
            bbox: [number, number, number, number];
            name: string;
            point: {
                type: string;
                coordinates: [number, number];
            };
            address: {
                addressLine: string;
                adminDistrict: string;
                adminDistrict2: string;
                countryRegion: string;
                formattedAddress: string;
                locality: string;
                postalCode: string;
            };
            confidence: string;
            entityType: string;
            geocodePoints: [
                {
                    type: string;
                    coordinates: [number, number];
                    calculationMethod: string;
                    usageTypes: [string];
                }
            ];
            matchCodes: string[];
        }[];
    }[];
    statusCode: 200 | 400 | 401 | 404 | 429 | 500 | 503;
    statusDescription: string;
    traceId: string;
}

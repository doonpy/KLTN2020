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

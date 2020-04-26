import { RequestPromiseOptions } from 'request-promise';
import Request from '../request/request';

type HereMapGeocodeResponse = {
    type: string;
    Response: {
        View: [
            {
                Result: [
                    {
                        Location: {
                            DisplayPosition: { Latitude: number; Longitude: number };
                        };
                    }
                ];
            }
        ];
    };
};

type BingMapGeocodeResponse = {
    resourceSets: [
        {
            resources: [
                {
                    point: {
                        coordinates: [10.780949592590332, 106.69911193847656];
                    };
                }
            ];
        }
    ];
};

export default class ExternalApi {
    private static instance: ExternalApi = new ExternalApi();

    /**
     * Get instance
     * @return {ExternalApi} instance
     */
    public static getInstance(): ExternalApi {
        if (!this.instance) {
            this.instance = new ExternalApi();
        }
        return this.instance;
    }

    /**
     * @param address
     * @return {lat:number; lng:number}
     */
    public async getCoordinateFromAddress(address: string): Promise<{ lat: number; lng: number }> {
        let apiKey: string = process.env.HERE_API_KEY ?? '';
        let addressClone: string = address;
        const requestOptions: RequestPromiseOptions = {
            method: 'GET',
            headers: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                },
            },
            json: true,
        };
        let endPointUrl = `https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey=${apiKey}&searchtext=${encodeURI(
            addressClone
        )}`;

        let response: HereMapGeocodeResponse | BingMapGeocodeResponse = ((await new Request(
            endPointUrl,
            requestOptions
        ).send()) as unknown) as HereMapGeocodeResponse;

        while (response.type === 'ApplicationError' || !response.Response.View.length) {
            const addressPart: string[] = addressClone.split(/,\s*/);
            addressClone = addressPart.slice(1).join(', ');

            if (!addressClone) {
                apiKey = process.env.BING_API_KEY ?? '';
                endPointUrl = `http://dev.virtualearth.net/REST/v1/Locations/VN/Hochiminh/${encodeURI(
                    addressClone
                )}?o=json&maxResults=1&key=${apiKey}`;
                response = ((await new Request(
                    endPointUrl,
                    requestOptions
                ).send()) as unknown) as BingMapGeocodeResponse;

                return {
                    lat: response.resourceSets[0].resources[0].point.coordinates[0],
                    lng: response.resourceSets[0].resources[0].point.coordinates[1],
                };
            }

            endPointUrl = `https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey=${apiKey}&searchtext=${encodeURI(
                addressClone
            )}`;
            response = await (((await new Request(
                endPointUrl,
                requestOptions
            ).send()) as unknown) as HereMapGeocodeResponse);
        }

        return {
            lat: response.Response.View[0].Result[0].Location.DisplayPosition.Latitude,
            lng: response.Response.View[0].Result[0].Location.DisplayPosition.Longitude,
        };
    }
}

import { RequestPromiseOptions } from 'request-promise';
import Request from '../request/request';

type GeocodeResponse = {
    type: string;
    Response: {
        MetaInfo: { Timestamp: string };
        View: [
            {
                _type: string;
                ViewId: number;
                Result: [
                    {
                        Relevance: number;
                        MatchLevel: string;
                        MatchQuality: { Country: number };
                        Location: {
                            LocationId: string;
                            LocationType: string;
                            DisplayPosition: { Latitude: number; Longitude: number };
                            NavigationPosition: [{ Latitude: number; Longitude: number }];
                            MapView: {
                                TopLeft: { Latitude: number; Longitude: number };
                                BottomRight: { Latitude: number; Longitude: number };
                            };
                            Address: {
                                Label: string;
                                Country: string;
                                AdditionalData: [{ value: string; key: string }];
                            };
                        };
                    }
                ];
            }
        ];
    };
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
        const apiKey: string = process.env.HERE_API_KEY || '';
        const requestOptions: RequestPromiseOptions = {
            method: 'GET',
            headers: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                },
            },
            json: true,
        };
        let endPointUrl: string = `https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey=${apiKey}&searchtext=${encodeURI(
            address
        )}`;

        try {
            let response: GeocodeResponse = <GeocodeResponse>(
                (<unknown>await new Request(endPointUrl, requestOptions).send())
            );

            while (response.type === 'ApplicationError' || !response.Response.View.length) {
                let addressPart: Array<string> = address.split(/\,\s*/);
                address = addressPart.slice(1).join(', ');
                if (!address) {
                    return { lat: NaN, lng: NaN };
                }
                endPointUrl = `https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey=${apiKey}&searchtext=${encodeURI(
                    address
                )}`;
                response = await (<GeocodeResponse>(<unknown>await new Request(endPointUrl, requestOptions).send()));
            }

            return {
                lat: response.Response.View[0].Result[0].Location.DisplayPosition.Latitude,
                lng: response.Response.View[0].Result[0].Location.DisplayPosition.Longitude,
            };
        } catch (error) {
            throw error;
        }
    }
}

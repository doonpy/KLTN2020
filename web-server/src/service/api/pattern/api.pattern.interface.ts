import { CommonApiModel } from '../../common/service/common.service.interface';

export interface PatternApiModel extends CommonApiModel {
    sourceUrl: string | null;
    mainLocator: {
        propertyType: string | null;
        title: string | null;
        describe: string | null;
        price: string | null;
        acreage: string | null;
        address: string | null;
        postDate: {
            locator: string | null;
            format: string | null;
            delimiter: string | null;
        };
    } | null;
    subLocator:
        | [
              {
                  name: string | null;
                  locator: string | null;
              }
          ]
        | []
        | null;
}

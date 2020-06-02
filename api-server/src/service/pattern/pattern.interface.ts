import { CommonApiModel, CommonDocumentModel } from '@common/service/common.service.interface';

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
                  value: string | null;
              }
          ]
        | []
        | null;
}

export interface PatternDocumentModel extends CommonDocumentModel {
    sourceUrl: string;
    mainLocator: {
        propertyType: string;
        title: string;
        describe: string;
        price: string;
        acreage: string;
        address: string;
        postDate: {
            locator: string;
            format: string;
            delimiter: string;
        };
    };
    subLocator: [
        {
            name: string;
            value: string;
        }
    ];
}

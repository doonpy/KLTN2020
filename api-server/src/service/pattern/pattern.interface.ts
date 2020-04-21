import {
    CommonApiModel,
    CommonDocumentModel,
    CommonLogicBaseInterface,
} from '../../common/service/common.service.interface';

export interface PatternApiModel extends CommonApiModel {
    sourceUrl: string | null;
    mainLocator: {
        propertyType: string;
        title: string;
        price: string;
        acreage: string;
        address: string;
        postDate: {
            locator: string;
            format: string;
            delimiter: string;
        };
    } | null;
    subLocator:
        | [
              {
                  name: string;
                  locator: string;
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
            locator: string;
        }
    ];
}

export interface PatternLogicInterface extends CommonLogicBaseInterface {
    /**
     * @param {string} sourceUrl
     *
     * @return {boolean}
     */
    isExistsWithSourceUrl(sourceUrl: string): Promise<boolean>;

    /**
     * @param {string} sourceUrl
     * @param {boolean | undefined} isNot
     *
     * @return {Promise<void>}
     */
    checkExistsWithSourceUrl(sourceUrl: string, isNot?: boolean): Promise<void>;
}

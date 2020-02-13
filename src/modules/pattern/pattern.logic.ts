import PatternModel from "./pattern.model";
import {Document, Types} from "mongoose";

class PatternLogic {
    /**
     * Get all pattern
     *
     * @return Promise<Document[] | Error>
     */
    public getAll = (): Promise<Document[] | Error> => {
        return new Promise((resolve, reject) => {
            PatternModel.find({}, {}, (error, patterns) => {
                if (error) {
                    reject(error);
                }

                resolve(patterns);
            });
        });
    };

    /**
     * Get pattern by ID
     *
     * @param id
     *
     * @return Promise<Document[] | Error | null>
     */
    public getById = (id: string): Promise<Document | Error | null> => {
        return new Promise((resolve, reject) => {
            PatternModel.findById(id, (error, pattern) => {
                if (error) {
                    reject(error);
                }

                resolve(pattern);
            });
        });
    };

    /**
     * Create new pattern
     *
     * @param catalogId
     * @param sourceUrl
     * @param mainLocator
     * @param subLocator
     *
     * @return Promise<Error | null>
     */
    public create = (
        catalogId: string,
        sourceUrl: string,
        mainLocator: object,
        subLocator: object
    ): Promise<Error | null> => {
        return new Promise((resolve, reject) => {
            new PatternModel({
                catalogId: catalogId,
                sourceUrl: sourceUrl,
                mainLocator: mainLocator,
                subLocator: subLocator
            }).save(error => {
                if (error) {
                    reject(error);
                }

                resolve();
            });
        });
    };

    /**
     * Update catalog with ID
     *
     * @param catalogId
     * @param title
     * @param url
     * @param detailUrlLocator
     * @param pageNumberLocator
     * @param hostId
     *
     * @return Promise<Error | null>
     */
    public update = (
        catalogId: string,
        title: string,
        url: string,
        detailUrlLocator: string,
        pageNumberLocator: string,
        hostId: string
    ): Promise<Error | null> => {
        return new Promise((resolve, reject) => {
            let updateObject = {
                title: title,
                url: url,
                locator: {
                    detailUrl: detailUrlLocator,
                    pageNumber: pageNumberLocator
                },
                hostId: hostId
            };
            PatternModel.findByIdAndUpdate(catalogId, updateObject, error => {
                if (error) {
                    reject(error);
                }

                resolve();
            });
        });
    };

    /**
     * Delete catalog by with ID
     *
     * @param catalogId
     *
     * @return Promise<Error | null>
     */
    public delete = (catalogId: string): Promise<Error | null> => {
        return new Promise((resolve, reject) => {
            PatternModel.findByIdAndDelete(catalogId, error => {
                if (error) {
                    reject(error);
                }

                resolve();
            });
        });
    };
}

export default PatternLogic;

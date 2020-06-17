import { NextFunction, Request, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import ResponseStatusCode from '@common/response-status-code';
import Validator from '@util/validator/Validator';
import Checker from '@util/checker';
import CommonConstant from '@common/constant';
import VisualMapPointLogic from './VisualMapPointLogic';
import { VisualMapPointDocumentModel } from './interface';
import VisualCommonController from '../VisualCommonController';
import VisualAdministrativeWardLogic from '@service/visual/administrative/ward/VisualAdministrativeWardLogic';
import { VisualAdministrativeWardDocumentModel } from '@service/visual/administrative/ward/interface';
import { getAggregationForGetAll } from '@service/visual/map-point/helper';

const commonPath = '/map-points';
const specifyIdPath = '/map-points/:id';
const MIN_LAT = -85;
const MAX_LAT = 85;
const MIN_LNG = -180;
const MAX_LNG = 180;
const MIN_NUMBER_VALUE = 0;
const MAX_NUMBER_VALUE = Number.MAX_SAFE_INTEGER;

export default class VisualMapPointController extends VisualCommonController {
    private static instance: VisualMapPointController;

    private visualMapPointLogic = VisualMapPointLogic.getInstance();

    private readonly PARAM_MIN_LAT = 'minLat';

    private readonly PARAM_MAX_LAT = 'maxLat';

    private readonly PARAM_MIN_LNG = 'minLng';

    private readonly PARAM_MAX_LNG = 'maxLng';

    private readonly PARAM_MIN_ACREAGE = 'minAcreage';

    private readonly PARAM_MAX_ACREAGE = 'maxAcreage';

    private readonly PARAM_MIN_PRICE = 'minPrice';

    private readonly PARAM_MAX_PRICE = 'maxPrice';

    private readonly PARAM_TRANSACTION_TYPE = 'transactionType';

    private readonly PARAM_PROPERTY_TYPE = 'propertyType';

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualMapPointController {
        if (!this.instance) {
            this.instance = new VisualMapPointController();
        }
        return this.instance;
    }

    protected async createRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    protected async deleteRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    protected async getAllRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_MIN_LAT,
                new Checker.Type.Decimal()
            );
            this.validator.addParamValidator(
                this.PARAM_MAX_LAT,
                new Checker.DecimalRange(MIN_LAT, MAX_LAT)
            );

            this.validator.addParamValidator(
                this.PARAM_MIN_LNG,
                new Checker.Type.Decimal()
            );
            this.validator.addParamValidator(
                this.PARAM_MAX_LNG,
                new Checker.DecimalRange(MIN_LNG, MAX_LNG)
            );

            this.validator.addParamValidator(
                this.PARAM_MIN_ACREAGE,
                new Checker.Type.Decimal()
            );
            this.validator.addParamValidator(
                this.PARAM_MIN_ACREAGE,
                new Checker.DecimalRange(MIN_NUMBER_VALUE, MAX_NUMBER_VALUE)
            );

            this.validator.addParamValidator(
                this.PARAM_MAX_ACREAGE,
                new Checker.Type.Decimal()
            );
            this.validator.addParamValidator(
                this.PARAM_MAX_ACREAGE,
                new Checker.DecimalRange(MIN_NUMBER_VALUE, MAX_NUMBER_VALUE)
            );

            this.validator.addParamValidator(
                this.PARAM_MIN_PRICE,
                new Checker.Type.Decimal()
            );
            this.validator.addParamValidator(
                this.PARAM_MIN_PRICE,
                new Checker.DecimalRange(MIN_NUMBER_VALUE, MAX_NUMBER_VALUE)
            );

            this.validator.addParamValidator(
                this.PARAM_MAX_PRICE,
                new Checker.Type.Decimal()
            );
            this.validator.addParamValidator(
                this.PARAM_MAX_PRICE,
                new Checker.DecimalRange(MIN_NUMBER_VALUE, MAX_NUMBER_VALUE)
            );

            this.validator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.DecimalRange(
                    1,
                    CommonConstant.TRANSACTION_TYPE.length
                )
            );

            this.validator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.DecimalRange(1, CommonConstant.PROPERTY_TYPE.length)
            );

            this.validator.validate(this.requestQuery);

            const visualAdministrativeWardLogic = VisualAdministrativeWardLogic.getInstance();
            const minLat =
                Number(this.requestQuery[this.PARAM_MIN_LAT]) || MIN_LAT;
            const maxLat =
                Number(this.requestQuery[this.PARAM_MAX_LAT]) || MAX_LAT;
            const minLng =
                Number(this.requestQuery[this.PARAM_MIN_LNG]) || MIN_LNG;
            const maxLng =
                Number(this.requestQuery[this.PARAM_MAX_LNG]) || MAX_LNG;
            const minAcreage =
                Number(this.requestQuery[this.PARAM_MIN_ACREAGE]) ||
                MIN_NUMBER_VALUE;
            const maxAcreage =
                Number(this.requestQuery[this.PARAM_MAX_ACREAGE]) ||
                MAX_NUMBER_VALUE;
            const minPrice =
                Number(this.requestQuery[this.PARAM_MIN_PRICE]) ||
                MIN_NUMBER_VALUE;
            const maxPrice =
                Number(this.requestQuery[this.PARAM_MAX_PRICE]) ||
                MAX_NUMBER_VALUE;
            const transactionType =
                Number(this.requestQuery[this.PARAM_TRANSACTION_TYPE]) ||
                undefined;
            const propertyType =
                Number(this.requestQuery[this.PARAM_PROPERTY_TYPE]) ||
                undefined;
            const transactionTypeAndPropertyTypeAggregations = {
                $and: [
                    transactionType
                        ? {
                              $eq: ['$$point.transactionType', transactionType],
                          }
                        : {},
                    propertyType
                        ? {
                              $eq: ['$$point.propertyType', propertyType],
                          }
                        : {},
                ],
            };
            const aggregations = getAggregationForGetAll(
                minLat,
                maxLat,
                minLng,
                maxLng,
                minAcreage,
                maxAcreage,
                minPrice,
                maxPrice,
                transactionTypeAndPropertyTypeAggregations
            );
            const [
                documents,
                { documents: visualAdministrativeWards },
            ] = await Promise.all<
                VisualMapPointDocumentModel[],
                { documents: VisualAdministrativeWardDocumentModel[] }
            >([
                this.visualMapPointLogic.getWithAggregation<
                    VisualMapPointDocumentModel
                >(aggregations),
                visualAdministrativeWardLogic.getAll({}),
            ]);

            const mapPoints = documents.map((document) => {
                document.wardId =
                    visualAdministrativeWards.filter(
                        ({ _id }) => document.wardId === _id
                    )[0] || null;
                document.districtId = document.wardId.districtId;
                document.points.forEach((point) => {
                    point.rawDataset = point.rawDataset.sort(
                        ({ acreage: first }, { acreage: second }) =>
                            second - first
                    );
                });

                return document;
            });
            const responseBody = {
                mapPoints: mapPoints.map((mapPoint) =>
                    this.visualMapPointLogic.convertToApiResponse(mapPoint)
                ),
            };

            ServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                responseBody
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    protected async getByIdRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    protected async updateRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    protected async getDocumentAmount(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const documentAmount = await this.visualMapPointLogic.getDocumentAmount();

            ServiceControllerBase.sendResponse(res, ResponseStatusCode.OK, {
                schema: 'visual-map-point',
                documentAmount,
            });
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}

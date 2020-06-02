import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '@common/service/common.service.controller.base';
import ResponseStatusCode from '@common/common.response-status.code';
import Validator from '@util/validator/validator';
import Checker from '@util/checker/checker.index';
import CommonConstant from '@common/common.constant';
import VisualMapPointLogic from './visual.map-point.logic';
import { VisualMapPointDocumentModel } from './visual.map-point.interface';
import VisualCommonController from '../visual.common.controller';
import VisualAdministrativeWardLogic from '@service/visual/administrative/ward/visual.administrative.ward.logic';
import { VisualAdministrativeWardDocumentModel } from '@service/visual/administrative/ward/visual.administrative.ward.interface';

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

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async createRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async deleteRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
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
            const aggregations = [
                {
                    $match: {
                        $and: [
                            {
                                lat: {
                                    $gte: minLat,
                                },
                            },
                            {
                                lat: {
                                    $lte: maxLat,
                                },
                            },
                            {
                                lng: {
                                    $gte: minLng,
                                },
                            },
                            {
                                lng: {
                                    $lte: maxLng,
                                },
                            },
                        ],
                    },
                },
                {
                    $project: {
                        districtId: 1,
                        wardId: 1,
                        lat: 1,
                        lng: 1,
                        points: {
                            $filter: {
                                input: '$points',
                                as: 'point',
                                cond: transactionTypeAndPropertyTypeAggregations,
                            },
                        },
                        cTime: 1,
                        mTime: 1,
                    },
                },
                {
                    $project: {
                        districtId: 1,
                        wardId: 1,
                        lat: 1,
                        lng: 1,
                        points: {
                            $map: {
                                input: '$points',
                                as: 'point',
                                in: {
                                    rawDataset: {
                                        $filter: {
                                            input: '$$point.rawDataset',
                                            as: 'rawData',
                                            cond: {
                                                $and: [
                                                    {
                                                        $gte: [
                                                            '$$rawData.acreage',
                                                            minAcreage,
                                                        ],
                                                    },
                                                    {
                                                        $lte: [
                                                            '$$rawData.acreage',
                                                            maxAcreage,
                                                        ],
                                                    },
                                                    {
                                                        $gte: [
                                                            '$$rawData.price',
                                                            minPrice,
                                                        ],
                                                    },
                                                    {
                                                        $lte: [
                                                            '$$rawData.price',
                                                            maxPrice,
                                                        ],
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                    transactionType: '$$point.transactionType',
                                    propertyType: '$$point.propertyType',
                                },
                            },
                        },
                        cTime: 1,
                        mTime: 1,
                    },
                },
            ];
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

                return document;
            });
            const responseBody = {
                mapPoints: mapPoints.map((mapPoint) =>
                    this.visualMapPointLogic.convertToApiResponse(mapPoint)
                ),
            };

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.OK,
                responseBody,
                res
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async getByIdRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async updateRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async getDocumentAmount(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const documentAmount = await this.visualMapPointLogic.getDocumentAmount();

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.OK,
                { schema: 'visual-map-point', documentAmount },
                res
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}

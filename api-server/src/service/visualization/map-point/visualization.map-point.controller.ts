import { NextFunction, Request, Response } from 'express';
import VisualizationCommonController from '../visualization.common.controller';
import CommonServiceControllerBase from '@common/service/common.service.controller.base';
import ResponseStatusCode from '@common/common.response-status.code';
import Validator from '@util/validator/validator';
import Checker from '@util/checker/checker.index';
import VisualizationMapPointLogic from './visualization.map-point.logic';
import { VisualizationMapPointApiModel, VisualizationMapPointDocumentModel } from './visualization.map-point.interface';
import VisualizationMapPointModel from './visualization.map-point.model';
import CommonConstant from '@common/common.constant';

const commonPath = '/map-points';
const specifyIdPath = '/map-points/:id';
const MIN_LAT = -85;
const MAX_LAT = 85;
const MIN_LNG = -180;
const MAX_LNG = 180;
const MIN_ACREAGE = 0;
const MAX_ACREAGE = Number.MAX_SAFE_INTEGER;

export default class VisualizationMapPointController extends VisualizationCommonController {
    private static instance: VisualizationMapPointController;

    private visualizationMapPointLogic: VisualizationMapPointLogic = VisualizationMapPointLogic.getInstance();

    private readonly PARAM_MIN_LAT: string = 'minLat';

    private readonly PARAM_MAX_LAT: string = 'maxLat';

    private readonly PARAM_MIN_LNG: string = 'minLng';

    private readonly PARAM_MAX_LNG: string = 'maxLng';

    private readonly PARAM_MIN_ACREAGE: string = 'minAcreage';

    private readonly PARAM_MAX_ACREAGE: string = 'maxAcreage';

    private readonly PARAM_TRANSACTION_TYPE: string = 'transactionType';

    private readonly PARAM_PROPERTY_TYPE: string = 'propertyType';

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualizationMapPointController {
        if (!this.instance) {
            this.instance = new VisualizationMapPointController();
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
    protected async createRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async deleteRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async getAllRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_MIN_LAT, new Checker.Type.Decimal());
            this.validator.addParamValidator(this.PARAM_MAX_LAT, new Checker.DecimalRange(MIN_LAT, MAX_LAT));

            this.validator.addParamValidator(this.PARAM_MIN_LNG, new Checker.Type.Decimal());
            this.validator.addParamValidator(this.PARAM_MAX_LNG, new Checker.DecimalRange(MIN_LNG, MAX_LNG));

            this.validator.addParamValidator(this.PARAM_MIN_ACREAGE, new Checker.Type.Decimal());
            this.validator.addParamValidator(
                this.PARAM_MIN_ACREAGE,
                new Checker.DecimalRange(MIN_ACREAGE, MAX_ACREAGE)
            );

            this.validator.addParamValidator(this.PARAM_MAX_ACREAGE, new Checker.Type.Decimal());
            this.validator.addParamValidator(
                this.PARAM_MAX_ACREAGE,
                new Checker.DecimalRange(MIN_ACREAGE, MAX_ACREAGE)
            );

            this.validator.addParamValidator(this.PARAM_TRANSACTION_TYPE, new Checker.Type.Integer());
            this.validator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.DecimalRange(0, CommonConstant.TRANSACTION_TYPE.length - 1)
            );

            this.validator.addParamValidator(this.PARAM_PROPERTY_TYPE, new Checker.Type.Integer());
            this.validator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.DecimalRange(0, CommonConstant.PROPERTY_TYPE.length - 1)
            );

            this.validator.validate(this.requestQuery);

            const conditions: object = {
                $and: [
                    { lat: { $gte: this.requestQuery[this.PARAM_MIN_LAT] || MIN_LAT } },
                    { lat: { $lte: this.requestQuery[this.PARAM_MAX_LAT] || MAX_LAT } },
                    { lng: { $gte: this.requestQuery[this.PARAM_MIN_LNG] || MIN_LNG } },
                    { lng: { $lte: this.requestQuery[this.PARAM_MAX_LNG] || MAX_LNG } },
                ],
            };
            let documents: VisualizationMapPointDocumentModel[] = await VisualizationMapPointModel.find(conditions);
            const minAcreage: number = Number(this.requestQuery[this.PARAM_MIN_ACREAGE]) || MIN_ACREAGE;
            const maxAcreage: number = Number(this.requestQuery[this.PARAM_MAX_ACREAGE]) || MAX_ACREAGE;
            const transactionType: number | undefined =
                Number(this.requestQuery[this.PARAM_TRANSACTION_TYPE]) || undefined;
            const propertyType: number | undefined = Number(this.requestQuery[this.PARAM_PROPERTY_TYPE]) || undefined;

            documents = documents.filter((document): boolean => {
                document.points = document.points.filter((point): boolean => {
                    if (transactionType !== undefined && point.transactionType !== transactionType) {
                        return false;
                    }

                    if (propertyType !== undefined && point.propertyType !== propertyType) {
                        return false;
                    }

                    point.rawDataset = point.rawDataset.filter(
                        ({ acreage }): boolean => acreage >= minAcreage && acreage <= maxAcreage
                    );

                    return point.rawDataset.length > 0;
                });

                return document.points.length > 0;
            });

            if (this.populate) {
                for (const document of documents) {
                    await this.visualizationMapPointLogic.populateDocument(document);
                }
            }

            const responseBody: object = {
                mapPoints: documents.map(
                    (document): VisualizationMapPointApiModel =>
                        this.visualizationMapPointLogic.convertToApiResponse(document)
                ),
            };

            CommonServiceControllerBase.sendResponse(ResponseStatusCode.OK, responseBody, res);
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
    protected async getWithIdRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async updateRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        next();
    }
}

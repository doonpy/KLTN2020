import { NextFunction, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import ResponseStatusCode from '@common/response-status-code';
import CommonConstant from '@common/constant';
import VisualMapPointLogic from './VisualMapPointLogic';
import {
    VisualMapPointDocumentModel,
    VisualMapPointRequestBodySchema,
    VisualMapPointRequestParamSchema,
    VisualMapPointRequestQuerySchema,
} from './interface';
import VisualAdministrativeWardLogic from '@service/visual/administrative/ward/VisualAdministrativeWardLogic';
import { VisualAdministrativeWardDocumentModel } from '@service/visual/administrative/ward/interface';
import { getAggregationForGetAll } from '@service/visual/map-point/helper';
import Joi from '@hapi/joi';

import { CommonRequest } from '@service/interface';

const commonPath = '/visualization/map-points';
const commonName = 'mapPoints';
const specifyIdPath = '/visualization/map-point/:id';
const specifyName = 'mapPoint';
const MIN_LAT = -85;
const MAX_LAT = 85;
const MIN_LNG = -180;
const MAX_LNG = 180;
const MIN_NUMBER_VALUE = 0;
const MAX_NUMBER_VALUE = Number.MAX_SAFE_INTEGER;

export default class VisualMapPointController extends ServiceControllerBase<
    VisualMapPointRequestParamSchema,
    VisualMapPointRequestQuerySchema,
    VisualMapPointRequestBodySchema
> {
    private static instance: VisualMapPointController;

    constructor() {
        super(commonName, specifyName, VisualMapPointLogic.getInstance());
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

    protected initValidateSchema(): void {
        this.reqQuerySchema = this.reqQuerySchema.keys({
            minLat: Joi.number(),
            maxLat: Joi.number(),
            minLng: Joi.number(),
            maxLng: Joi.number(),
            minAcreage: Joi.number().min(0),
            maxAcreage: Joi.number().min(0),
            minPrice: Joi.number().min(0),
            maxPrice: Joi.number().min(0),
            transactionType: Joi.number().integer().min(CommonConstant.MIN_ID),
            propertyType: Joi.number().integer().min(CommonConstant.MIN_ID),
        });
    }

    protected async getAllHandler(
        req: CommonRequest<
            VisualMapPointRequestParamSchema,
            VisualMapPointRequestBodySchema,
            VisualMapPointRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const visualAdministrativeWardLogic = VisualAdministrativeWardLogic.getInstance();
            const minLat = Number(this.reqQuery.minLat) || MIN_LAT;
            const maxLat = Number(this.reqQuery.maxLat) || MAX_LAT;
            const minLng = Number(this.reqQuery.minLng) || MIN_LNG;
            const maxLng = Number(this.reqQuery.maxLng) || MAX_LNG;
            const minAcreage =
                Number(this.reqQuery.minAcreage) || MIN_NUMBER_VALUE;
            const maxAcreage =
                Number(this.reqQuery.maxAcreage) || MAX_NUMBER_VALUE;
            const minPrice = Number(this.reqQuery.minPrice) || MIN_NUMBER_VALUE;
            const maxPrice = Number(this.reqQuery.maxPrice) || MAX_NUMBER_VALUE;
            const transactionType =
                Number(this.reqQuery.transactionType) || undefined;
            const propertyType =
                Number(this.reqQuery.propertyType) || undefined;
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
                this.logicInstance.getWithAggregation<
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
                    this.logicInstance.convertToApiResponse(mapPoint)
                ),
            };

            req.locals!.statusCode = ResponseStatusCode.OK;
            req.locals!.responseBody = responseBody;
            next();
        } catch (error) {
            next(error);
        }
    }
}

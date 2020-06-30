import { NextFunction, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import ResponseStatusCode from '@common/response-status-code';
import VisualSummaryDistrictLogic from './VisualSummaryDistrictLogic';
import {
    VisualSummaryDistrictRequestBodySchema,
    VisualSummaryDistrictRequestParamSchema,
    VisualSummaryDistrictRequestQuerySchema,
} from '@service/visual/summary/district/interface';
import { CommonRequest } from '@service/interface';

const commonPath = '/visualization/summary-district';
const commonName = 'summaryDistrict';
const specifyIdPath = '/visualization/summary-district/:id';
const specifyName = 'summaryDistrict';

export default class VisualSummaryDistrictController extends ServiceControllerBase<
    VisualSummaryDistrictRequestParamSchema,
    VisualSummaryDistrictRequestQuerySchema,
    VisualSummaryDistrictRequestBodySchema
> {
    private static instance: VisualSummaryDistrictController;

    constructor() {
        super(
            commonName,
            specifyName,
            VisualSummaryDistrictLogic.getInstance()
        );
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualSummaryDistrictController {
        if (!this.instance) {
            this.instance = new VisualSummaryDistrictController();
        }
        return this.instance;
    }

    protected async getAllHandler(
        req: CommonRequest<
            VisualSummaryDistrictRequestParamSchema,
            VisualSummaryDistrictRequestBodySchema,
            VisualSummaryDistrictRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { documents } = await this.logicInstance.getAll({});
            const responseBody = {
                summaryDistrict: documents.map((document) =>
                    this.logicInstance.convertToApiResponse(document)
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

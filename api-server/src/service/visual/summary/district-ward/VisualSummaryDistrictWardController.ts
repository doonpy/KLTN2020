import { NextFunction, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import ResponseStatusCode from '@common/response-status-code';
import VisualSummaryDistrictWardLogic from './VisualSummaryDistrictWardLogic';
import {
    VisualSummaryDistrictWardRequestBodySchema,
    VisualSummaryDistrictWardRequestParamSchema,
    VisualSummaryDistrictWardRequestQuerySchema,
} from '@service/visual/summary/district-ward/interface';
import { CommonRequest } from '@service/interface';

const commonPath = '/visualization/summary-district-ward';
const commonName = 'summaryDistrictWard';
const specifyIdPath = '/visualization/summary-district-ward/:id';
const specifyName = 'summaryDistrictWard';

export default class VisualSummaryDistrictWardController extends ServiceControllerBase<
    VisualSummaryDistrictWardRequestParamSchema,
    VisualSummaryDistrictWardRequestQuerySchema,
    VisualSummaryDistrictWardRequestBodySchema
> {
    private static instance: VisualSummaryDistrictWardController;

    constructor() {
        super(
            commonName,
            specifyName,
            VisualSummaryDistrictWardLogic.getInstance()
        );
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualSummaryDistrictWardController {
        if (!this.instance) {
            this.instance = new VisualSummaryDistrictWardController();
        }
        return this.instance;
    }

    protected async getAllHandler(
        req: CommonRequest<
            VisualSummaryDistrictWardRequestParamSchema,
            VisualSummaryDistrictWardRequestBodySchema,
            VisualSummaryDistrictWardRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { documents } = await this.logicInstance.getAll({});
            const responseBody = {
                summaryDistrictWard: documents.map((document) =>
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

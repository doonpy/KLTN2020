import { NextFunction, Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import VisualizationSummaryDistrictModel from './summary/district/visualization.summary.district.model';
import { VisualizationSummaryDistrictWardDocumentModel } from './summary/district-ward/visualization.summary.district-ward.interface';
import VisualizationSummaryDistrictWardModel from './summary/district-ward/visualization.summary.district-ward.model';
import CommonServiceControllerBase from '../../common/service/common.service.controller.base';
import ResponseStatusCode from '../../common/common.response-status.code';
import { VisualizationSummaryDistrictDocumentModel } from './summary/district/visualization.summary.district.interface';
import { VisualizationProvinceSchema } from './province/visualization.province.model';
import { VisualizationDistrictSchema } from './district/visualization.district.model';
import { VisualizationWardSchema } from './ward/visualization.ward.model';
import { VisualizationProvinceDocumentModel } from './province/visualization.province.interface';
import { VisualizationWardApiModel, VisualizationWardDocumentModel } from './ward/visualization.ward.interface';
import {
    VisualizationDistrictApiModel,
    VisualizationDistrictDocumentModel,
} from './district/visualization.district.interface';

const commonPath = '/visualization';

export default class VisualizationController {
    private static instance: VisualizationController;

    public router: Router = Router();

    constructor() {
        this.initSchema();
        this.router.get(`${commonPath}/map`, this.getDataForMap.bind(this));
    }

    /**
     * @return {RawDataController}
     */
    public static getInstance(): VisualizationController {
        if (!this.instance) {
            this.instance = new VisualizationController();
        }

        return this.instance;
    }

    /**
     * Initialize default schema
     */
    private initSchema(): void {
        mongoose.model<VisualizationProvinceDocumentModel>('visualization_province', VisualizationProvinceSchema);
        mongoose.model<VisualizationDistrictDocumentModel>('visualization_district', VisualizationDistrictSchema);
        mongoose.model<VisualizationWardDocumentModel>('visualization_ward', VisualizationWardSchema);
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    public async getDataForMap(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const summaryByDistrict: VisualizationSummaryDistrictDocumentModel[] = await VisualizationSummaryDistrictModel.find().populate(
                'districtId'
            );
            const summaryByDistrictWard: VisualizationSummaryDistrictWardDocumentModel[] = await VisualizationSummaryDistrictWardModel.find().populate(
                'districtId wardId'
            );
            const responseBody: object = {
                districtSummary: summaryByDistrict.map(({ _id, districtId, summaryAmount, summary }) => {
                    let districtApiModel: VisualizationDistrictApiModel | number = districtId;
                    if (districtId) {
                        districtApiModel = {
                            name: ((districtId as unknown) as VisualizationDistrictDocumentModel).name,
                            code: ((districtId as unknown) as VisualizationDistrictDocumentModel).code,
                            acreage: ((districtId as unknown) as VisualizationDistrictDocumentModel).acreage,
                        };
                    }

                    return {
                        id: _id ?? null,
                        district: districtApiModel ?? null,
                        summaryAmount: summaryAmount ?? null,
                        summary: summary ?? null,
                    };
                }),
                districtWardSummary: summaryByDistrictWard.map(
                    ({ _id, districtId, wardId, summaryAmount, summary }) => {
                        let districtApiModel: VisualizationDistrictApiModel | number = districtId;
                        if (districtId) {
                            districtApiModel = {
                                name: ((districtId as unknown) as VisualizationDistrictDocumentModel).name,
                                code: ((districtId as unknown) as VisualizationDistrictDocumentModel).code,
                                acreage: ((districtId as unknown) as VisualizationDistrictDocumentModel).acreage,
                            };
                        }

                        let wardApiModel: VisualizationWardApiModel | number = wardId;
                        if (wardId) {
                            wardApiModel = {
                                name: ((wardId as unknown) as VisualizationWardDocumentModel).name,
                                code: ((wardId as unknown) as VisualizationWardDocumentModel).code,
                            };
                        }

                        return {
                            id: _id ?? null,
                            district: districtApiModel ?? null,
                            ward: wardApiModel ?? null,
                            summaryAmount: summaryAmount ?? null,
                            summary: summary ?? null,
                        };
                    }
                ),
            };

            CommonServiceControllerBase.sendResponse(ResponseStatusCode.OK, responseBody, res);
        } catch (error) {
            next(error);
        }
    }
}

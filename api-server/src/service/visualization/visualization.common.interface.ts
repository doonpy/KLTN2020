import { CommonApiModel, CommonDocumentModel } from '@common/service/common.service.interface';

export interface VisualizationCommonLogicInterface {
    /**
     * @param {CommonDocumentModel} input
     *
     * @return {CommonApiModel}
     */
    convertToApiResponse(input: CommonDocumentModel): CommonApiModel;
}

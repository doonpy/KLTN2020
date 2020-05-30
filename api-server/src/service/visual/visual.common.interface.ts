import { CommonApiModel, CommonDocumentModel } from '@common/service/common.service.interface';

export interface VisualCommonLogicInterface {
    /**
     * @param {CommonDocumentModel} input
     *
     * @return {CommonApiModel}
     */
    convertToApiResponse(input: CommonDocumentModel): CommonApiModel;
}

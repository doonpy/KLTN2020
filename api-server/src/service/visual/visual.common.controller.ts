import CommonServiceControllerBase from '@common/service/common.service.controller.base';

const resourcePath = '/visualization';

export default abstract class VisualCommonController extends CommonServiceControllerBase {
    protected constructor() {
        super();
        this.commonPath += resourcePath;
        this.specifyIdPath += resourcePath;
    }
}

import CommonServiceControllerBase from '@service/CommonServiceControllerBase';

const resourcePath = '/visualization';

export default abstract class VisualCommonController extends CommonServiceControllerBase {
    protected constructor() {
        super();
        this.commonPath += resourcePath;
        this.specifyIdPath += resourcePath;
    }
}

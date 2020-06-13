import ServiceControllerBase from '@service/ServiceControllerBase';

const resourcePath = '/visualization';

export default abstract class VisualCommonController extends ServiceControllerBase {
    protected constructor() {
        super();
        this.commonPath += resourcePath;
        this.specifyIdPath += resourcePath;
    }
}

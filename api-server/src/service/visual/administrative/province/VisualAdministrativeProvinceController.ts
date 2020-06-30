import ServiceControllerBase from '@service/ServiceControllerBase';
import VisualAdministrativeProvinceLogic from './VisualAdministrativeProvinceLogic';
import {
    VisualAdministrativeProvinceRequestBodySchema,
    VisualAdministrativeProvinceRequestParamSchema,
    VisualAdministrativeProvinceRequestQuerySchema,
} from '@service/visual/administrative/province/interface';

const commonPath = '/visualization/administrative/provinces';
const commonName = 'provinces';
const specifyIdPath = '/visualization/administrative/province/:id';
const specifyName = 'province';

export default class VisualAdministrativeProvinceController extends ServiceControllerBase<
    VisualAdministrativeProvinceRequestParamSchema,
    VisualAdministrativeProvinceRequestQuerySchema,
    VisualAdministrativeProvinceRequestBodySchema
> {
    private static instance: VisualAdministrativeProvinceController;

    constructor() {
        super(
            commonName,
            specifyName,
            VisualAdministrativeProvinceLogic.getInstance()
        );
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualAdministrativeProvinceController {
        if (!this.instance) {
            this.instance = new VisualAdministrativeProvinceController();
        }
        return this.instance;
    }
}

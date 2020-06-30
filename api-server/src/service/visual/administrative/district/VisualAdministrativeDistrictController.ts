import ServiceControllerBase from '@service/ServiceControllerBase';
import VisualAdministrativeDistrictLogic from './VisualAdministrativeDistrictLogic';
import {
    VisualAdministrativeDistrictRequestBodySchema,
    VisualAdministrativeDistrictRequestParamSchema,
    VisualAdministrativeDistrictRequestQuerySchema,
} from '@service/visual/administrative/district/interface';

const commonPath = '/visualization/administrative/districts';
const commonName = 'districts';
const specifyIdPath = '/visualization/administrative/district/:id';
const specifyName = 'district';

export default class VisualAdministrativeDistrictController extends ServiceControllerBase<
    VisualAdministrativeDistrictRequestParamSchema,
    VisualAdministrativeDistrictRequestQuerySchema,
    VisualAdministrativeDistrictRequestBodySchema
> {
    private static instance: VisualAdministrativeDistrictController;

    constructor() {
        super(
            commonName,
            specifyName,
            VisualAdministrativeDistrictLogic.getInstance()
        );
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualAdministrativeDistrictController {
        if (!this.instance) {
            this.instance = new VisualAdministrativeDistrictController();
        }
        return this.instance;
    }
}

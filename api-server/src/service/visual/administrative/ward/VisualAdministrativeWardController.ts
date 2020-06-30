import ServiceControllerBase from '@service/ServiceControllerBase';
import VisualAdministrativeWardLogic from './VisualAdministrativeWardLogic';
import {
    VisualAdministrativeWardRequestBodySchema,
    VisualAdministrativeWardRequestParamSchema,
    VisualAdministrativeWardRequestQuerySchema,
} from '@service/visual/administrative/ward/interface';

const commonPath = '/visualization/administrative/wards';
const commonName = 'wards';
const specifyIdPath = '/visualization/administrative/ward/:id';
const specifyName = 'ward';

export default class VisualAdministrativeWardController extends ServiceControllerBase<
    VisualAdministrativeWardRequestParamSchema,
    VisualAdministrativeWardRequestQuerySchema,
    VisualAdministrativeWardRequestBodySchema
> {
    private static instance: VisualAdministrativeWardController;

    constructor() {
        super(
            commonName,
            specifyName,
            VisualAdministrativeWardLogic.getInstance()
        );
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualAdministrativeWardController {
        if (!this.instance) {
            this.instance = new VisualAdministrativeWardController();
        }
        return this.instance;
    }
}

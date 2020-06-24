import ServiceControllerBase from '@service/ServiceControllerBase';
import VisualAdministrativeCountryLogic from './VisualAdministrativeCountryLogic';
import {
    VisualAdministrativeCountryRequestBodySchema,
    VisualAdministrativeCountryRequestParamSchema,
    VisualAdministrativeCountryRequestQuerySchema,
} from '@service/visual/administrative/country/interface';

const commonPath = '/visualization/administrative/countries';
const commonName = 'countries';
const specifyIdPath = '/visualization/administrative/country/:id';
const specifyName = 'country';

export default class VisualAdministrativeCountryController extends ServiceControllerBase<
    VisualAdministrativeCountryRequestParamSchema,
    VisualAdministrativeCountryRequestQuerySchema,
    VisualAdministrativeCountryRequestBodySchema
> {
    private static instance: VisualAdministrativeCountryController;

    constructor() {
        super(
            commonName,
            specifyName,
            VisualAdministrativeCountryLogic.getInstance()
        );
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualAdministrativeCountryController {
        if (!this.instance) {
            this.instance = new VisualAdministrativeCountryController();
        }
        return this.instance;
    }
}

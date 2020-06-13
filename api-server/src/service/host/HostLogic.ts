import CommonLogicBase from '@service/ServiceLogicBase';
import Model from './model';
import {
    HostApiModel,
    HostDocumentModel,
    HostLogicInterface,
} from './interface';

export default class HostLogic
    extends CommonLogicBase<HostDocumentModel, HostApiModel>
    implements HostLogicInterface {
    public static instance: HostLogic;

    constructor() {
        super(Model);
    }

    /**
     * @return {HostLogic}
     */
    public static getInstance(): HostLogic {
        if (!this.instance) {
            this.instance = new HostLogic();
        }

        return this.instance;
    }

    /**
     * @param {string} domain
     *
     * @return Promise<HostDocumentModel | null>
     */
    public async getByDomain(domain: string): Promise<HostDocumentModel> {
        await this.checkExisted({ domain });

        return (await Model.findOne({
            domain,
        }).exec()) as HostDocumentModel;
    }

    /**
     * @param {HostDocumentModel}
     *
     * @return {HostApiModel}
     */
    public convertToApiResponse({
        _id,
        name,
        domain,
        cTime,
        mTime,
    }: HostDocumentModel): HostApiModel {
        return {
            id: _id ?? null,
            name: name ?? null,
            domain: domain ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

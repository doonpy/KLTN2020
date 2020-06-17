import CommonLogicBase from '@service/ServiceLogicBase';
import Model from './model';
import { HostApiModel, HostDocumentModel } from './interface';

export default class HostLogic extends CommonLogicBase<
    HostDocumentModel,
    HostApiModel
> {
    public static instance: HostLogic;

    constructor() {
        super(Model);
    }

    public static getInstance(): HostLogic {
        if (!this.instance) {
            this.instance = new HostLogic();
        }

        return this.instance;
    }

    public async getByDomain(domain: string): Promise<HostDocumentModel> {
        await this.checkExisted({ domain });

        return (await Model.findOne({
            domain,
        }).exec()) as HostDocumentModel;
    }

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

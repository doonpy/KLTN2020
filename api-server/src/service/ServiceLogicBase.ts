import {
    ApiModelBase,
    DocumentModelBase,
    CommonLogicBaseInterface,
    CommonOptions,
    GetAllReturnData,
} from '@service/interface';
import { CreateQuery, FilterQuery, Model, UpdateQuery } from 'mongoose';
import ResponseStatusCode from '@common/response-status-code';
import Wording from '@service/wording';

enum ValidateType {
    EXISTED,
    NOT_EXISTED,
}

interface ValidateInput {
    [key: string]: any;
}

export default abstract class ServiceLogicBase<
    DocumentModel extends DocumentModelBase,
    ApiModel extends ApiModelBase
> implements CommonLogicBaseInterface<DocumentModel, ApiModel> {
    protected constructor(protected model: Model<DocumentModel>) {}

    private async validate(
        properties: ValidateInput[],
        type: ValidateType
    ): Promise<void> {
        const promise: Promise<void>[] = [];
        properties.forEach((prop) => {
            if (type === ValidateType.EXISTED) {
                promise.push(this.checkExisted(prop));
            } else {
                promise.push(this.checkNotExisted(prop));
            }
        });

        await Promise.all(promise);
    }

    public async getAll({
        limit,
        offset,
        conditions,
    }: CommonOptions): Promise<GetAllReturnData<DocumentModel>> {
        const documentQuery = this.model.find(conditions ?? {});
        const remainQuery = this.model.countDocuments(conditions ?? {});

        if (offset) {
            documentQuery.skip(offset);
            remainQuery.skip(offset);
        }

        if (limit) {
            documentQuery.limit(limit);
        }

        const promises: [Promise<DocumentModel[]>, Promise<number> | number] = [
            documentQuery.exec(),
            limit ? remainQuery.exec() : -1,
        ];
        const [documents, remainAmount] = await Promise.all(promises);

        return { documents, hasNext: documents.length < remainAmount };
    }

    public async getById(id: number): Promise<DocumentModel | never> {
        await this.checkExisted({ _id: id });

        return (await this.model.findById(id)) as DocumentModel;
    }

    public async getOne(conditions: object): Promise<DocumentModel | null> {
        return this.model.findOne(conditions);
    }

    public async create(
        input: DocumentModel,
        validateExistedProperties?: ValidateInput[],
        validateNotExistedProperties?: ValidateInput[]
    ): Promise<DocumentModel> {
        if (validateExistedProperties) {
            await this.validate(
                validateExistedProperties,
                ValidateType.EXISTED
            );
        }

        if (validateNotExistedProperties) {
            await this.validate(
                validateNotExistedProperties,
                ValidateType.NOT_EXISTED
            );
        }

        return this.model.create(input as CreateQuery<DocumentModel>);
    }

    public async update(
        id: number,
        input: UpdateQuery<DocumentModel>,
        validateExistedProperties?: ValidateInput[],
        validateNotExistedProperties?: ValidateInput[]
    ): Promise<DocumentModel | never> {
        await this.checkExisted({ _id: id });

        if (validateExistedProperties) {
            await this.validate(
                validateExistedProperties,
                ValidateType.EXISTED
            );
        }

        if (validateNotExistedProperties) {
            await this.validate(
                validateNotExistedProperties,
                ValidateType.NOT_EXISTED
            );
        }

        const document = await this.model.findById(id);
        Object.keys(input).forEach((key) => {
            document!.set(key, input[key]);
        });

        return document!.save();
    }

    public async delete(id: number): Promise<void> {
        await this.checkExisted({ _id: id });
        await this.model.findByIdAndDelete(id);
    }

    public async isExists(conditions: object): Promise<boolean> {
        return (await this.model.findOne(conditions)) !== null;
    }

    public async checkExisted(conditions: object): Promise<void> {
        if (!(await this.isExists(conditions))) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: {
                    wording: Wording.CAUSE.CAU_CM_SER_1,
                    value: [],
                },
                message: {
                    wording: Wording.MESSAGE.MSG_CM_SER_1,
                    value: [Wording.RESOURCE.RSC_CM_SER_1, conditions],
                },
            };
        }
    }

    public async checkNotExisted(conditions: object): Promise<void> {
        if (await this.isExists(conditions)) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: {
                    wording: Wording.CAUSE.CAU_CM_SER_2,
                    value: [],
                },
                message: {
                    wording: Wording.MESSAGE.MSG_CM_SER_2,
                    value: [Wording.RESOURCE.RSC_CM_SER_1, conditions],
                },
            };
        }
    }

    /**
     * Get current amount document
     */
    public async getDocumentAmount(conditions?: object): Promise<number> {
        return this.model.countDocuments(conditions ?? {});
    }

    public abstract convertToApiResponse(input: DocumentModel): ApiModel;

    public async getWithAggregation<AT>(aggregations: object[]): Promise<AT[]> {
        return this.model.aggregate<AT>(aggregations).allowDiskUse(true).exec();
    }
}

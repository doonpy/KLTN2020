import {
    ApiModelBase,
    DocumentModelBase,
    CommonOptions,
    GetAllReturnData,
    ValidateProperties,
} from '@service/interface';
import {
    CreateQuery,
    FilterQuery,
    Model,
    MongooseFilterQuery,
    UpdateQuery,
} from 'mongoose';
import ResponseStatusCode from '@common/response-status-code';
import Wording from '@service/wording';

enum ValidateType {
    EXISTED,
    NOT_EXISTED,
}

export default abstract class ServiceLogicBase<
    DocumentModel extends DocumentModelBase,
    ApiModel extends ApiModelBase
> {
    protected constructor(protected model: Model<DocumentModel>) {}

    private async validate(
        properties: MongooseFilterQuery<DocumentModel>,
        type: ValidateType
    ): Promise<void> {
        const promise: Array<Promise<void>> = [];
        Object.keys(properties).forEach((key) => {
            if (type === ValidateType.EXISTED) {
                promise.push(this.checkExisted(properties[key]));
            } else {
                promise.push(this.checkNotExisted(properties[key]));
            }
        });

        await Promise.all(promise);
    }

    public async getAll({
        limit,
        offset,
        conditions,
    }: CommonOptions<DocumentModel>): Promise<GetAllReturnData<DocumentModel>> {
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

    public async getById(id: number): Promise<DocumentModel | null> {
        return this.model.findById(id);
    }

    public async getOne(
        conditions: MongooseFilterQuery<DocumentModel>
    ): Promise<DocumentModel | null> {
        return this.model.findOne(conditions);
    }

    public async create(
        input: DocumentModel,
        { exist, notExist }: ValidateProperties<DocumentModel> = {}
    ): Promise<DocumentModel> {
        if (exist) {
            await this.validate(exist, ValidateType.EXISTED);
        }

        if (notExist) {
            await this.validate(notExist, ValidateType.NOT_EXISTED);
        }

        return this.model.create(input as CreateQuery<DocumentModel>);
    }

    public async update(
        id: number,
        input: UpdateQuery<DocumentModel>,
        { exist, notExist }: ValidateProperties<DocumentModel> = {}
    ): Promise<DocumentModel | never> {
        if (exist) {
            await this.validate(exist, ValidateType.EXISTED);
        }

        if (notExist) {
            await this.validate(notExist, ValidateType.NOT_EXISTED);
        }

        await this.checkExisted({ _id: id } as MongooseFilterQuery<
            DocumentModel
        >);
        return (await this.model.findByIdAndUpdate(id, input))!;
    }

    public async delete(id: number): Promise<DocumentModel | null> {
        return this.model.findByIdAndDelete(id);
    }

    public async deleteByConditions(
        conditions: FilterQuery<DocumentModel>
    ): Promise<number> {
        const { deletedCount } = await this.model.deleteMany(conditions);

        return deletedCount ?? 0;
    }

    public async isExists(
        conditions: MongooseFilterQuery<DocumentModel>
    ): Promise<boolean> {
        return (await this.model.findOne(conditions)) !== null;
    }

    public async checkExisted(
        conditions: MongooseFilterQuery<DocumentModel>
    ): Promise<void> {
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

    public async checkNotExisted(
        conditions: MongooseFilterQuery<DocumentModel>
    ): Promise<void> {
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
    public async getDocumentAmount(
        conditions?: MongooseFilterQuery<DocumentModel>
    ): Promise<number> {
        return this.model.countDocuments(conditions ?? {});
    }

    public abstract convertToApiResponse(input: DocumentModel): ApiModel;

    public async getWithAggregation<AT>(
        aggregations: Array<Record<string, any>>
    ): Promise<AT[]> {
        return this.model.aggregate<AT>(aggregations).allowDiskUse(true).exec();
    }
}

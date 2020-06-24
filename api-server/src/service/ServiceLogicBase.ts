import {
    ApiModelBase,
    DocumentModelBase,
    CommonOptions,
    GetAllReturnData,
    ValidateProperties,
    CommonRequestBodySchema,
} from '@service/interface';
import { CreateQuery, FilterQuery, Model } from 'mongoose';
import ResponseStatusCode from '@common/response-status-code';
import Wording from '@service/wording';
import ExceptionCustomize from '@util/exception/ExceptionCustomize';
import { replaceMetaDataString } from '@util/helper/string';

enum ValidateType {
    EXISTED,
    NOT_EXISTED,
}

interface ValidateExist<D extends DocumentModelBase> {
    exist?: Array<FilterQuery<D>>;
    notExist?: Array<FilterQuery<D>>;
}

export default abstract class ServiceLogicBase<
    DocumentModel extends DocumentModelBase,
    ApiModel extends ApiModelBase
> {
    protected constructor(protected model: Model<DocumentModel>) {}

    public async getAll({
        limit,
        offset,
        conditions,
        sort,
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

        if (sort) {
            documentQuery.sort(sort);
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
        conditions: FilterQuery<DocumentModel>
    ): Promise<DocumentModel | null> {
        return this.model.findOne(conditions);
    }

    private async validate(
        properties: Array<FilterQuery<DocumentModel>>,
        type: ValidateType
    ): Promise<void> {
        const promise: Array<Promise<void>> = [];
        properties.forEach((property) => {
            if (type === ValidateType.EXISTED) {
                promise.push(this.checkExisted(property));
            } else {
                promise.push(this.checkNotExisted(property));
            }
        });

        await Promise.all(promise);
    }

    public async create(
        input: Record<string, any>,
        { exist, notExist }: ValidateExist<DocumentModel> = {}
    ): Promise<DocumentModel> {
        if (exist) {
            await this.validate(exist, ValidateType.EXISTED);
        }

        if (notExist) {
            await this.validate(notExist, ValidateType.NOT_EXISTED);
        }

        return this.model.create(input as CreateQuery<DocumentModel>);
    }

    private updateProperty(
        input: Record<string, any>,
        document: Record<string, any>
    ) {
        for (const key of Object.keys(input)) {
            if (input[key]) {
                if (typeof input[key] === 'object') {
                    this.updateProperty(input[key], document[key]);
                } else if (input[key] !== document[key]) {
                    document[key] = input[key];
                }
            }
        }
    }

    public async update(
        id: number,
        input: CommonRequestBodySchema,
        { exist, notExist }: ValidateProperties<DocumentModel> = {}
    ): Promise<DocumentModel | never> {
        await this.checkExisted({ _id: id } as FilterQuery<DocumentModel>);

        if (exist) {
            await this.validate(exist, ValidateType.EXISTED);
        }

        if (notExist) {
            await this.validate(notExist, ValidateType.NOT_EXISTED);
        }

        const document = (await this.getById(id))! as Record<string, any>;
        this.updateProperty(input, document);
        return document!.save();
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
        conditions: FilterQuery<DocumentModel>
    ): Promise<boolean> {
        return (await this.model.findOne(conditions)) !== null;
    }

    public async checkExisted(
        conditions: FilterQuery<DocumentModel>
    ): Promise<void> {
        if (!(await this.isExists(conditions))) {
            throw new ExceptionCustomize(
                ResponseStatusCode.BAD_REQUEST,
                Wording.CAUSE.CAU_CM_SER_1,
                replaceMetaDataString(Wording.MESSAGE.MSG_CM_SER_1, [
                    conditions,
                ])
            );
        }
    }

    public async checkNotExisted(
        conditions: FilterQuery<DocumentModel>
    ): Promise<void> {
        if (await this.isExists(conditions)) {
            throw new ExceptionCustomize(
                ResponseStatusCode.BAD_REQUEST,
                Wording.CAUSE.CAU_CM_SER_2,
                replaceMetaDataString(Wording.MESSAGE.MSG_CM_SER_2, [
                    conditions,
                ])
            );
        }
    }

    /**
     * Get current amount document
     */
    public async getDocumentAmount(
        conditions?: FilterQuery<DocumentModel>
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

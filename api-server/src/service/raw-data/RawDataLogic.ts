import ServiceLogicBase from '@service/ServiceLogicBase';
import CommonConstant from '@common/constant';
import Model from './model';
import {
    DetailUrlApiModel,
    DetailUrlDocumentModel,
} from '../detail-url/interface';
import {
    CoordinateApiModel,
    CoordinateDocumentModel,
} from '../coordinate/interface';
import CoordinateLogic from '../coordinate/CoordinateLogic';
import DetailUrlLogic from '../detail-url/DetailUrlLogic';
import {
    RawDataApiModel,
    RawDataDocumentModel,
    RawDataPrice,
} from './interface';
import { MongooseFilterQuery } from 'mongoose';

export default class RawDataLogic extends ServiceLogicBase<
    RawDataDocumentModel,
    RawDataApiModel
> {
    private static instance: RawDataLogic;

    constructor() {
        super(Model);
    }

    public static getInstance(): RawDataLogic {
        if (!this.instance) {
            this.instance = new RawDataLogic();
        }

        return this.instance;
    }

    public getPropertyTypeIndex(propertyTypeData: string): number {
        const propertyType:
            | number
            | undefined = CommonConstant.PROPERTY_TYPE.find(({ wording }) =>
            RegExp(wording.join(', ').replace(', ', '|'), 'i').test(
                propertyTypeData
            )
        )?.id;

        if (!propertyType) {
            return NaN;
        }

        return propertyType;
    }

    public async countDocumentsWithConditions(
        conditions?: MongooseFilterQuery<RawDataDocumentModel>
    ): Promise<number> {
        return Model.countDocuments(conditions || {}).exec();
    }

    public convertToApiResponse({
        _id,
        transactionType,
        propertyType,
        detailUrlId,
        postDate,
        title,
        describe,
        price,
        acreage,
        address,
        others,
        coordinateId,
        cTime,
        mTime,
    }: RawDataDocumentModel): RawDataApiModel {
        let detailUrl: DetailUrlApiModel | number | null = null;
        let coordinate: CoordinateApiModel | number | null = null;

        if (detailUrlId) {
            if (typeof detailUrlId === 'object') {
                detailUrl = DetailUrlLogic.getInstance().convertToApiResponse(
                    detailUrlId as DetailUrlDocumentModel
                );
            } else {
                detailUrl = detailUrlId as number;
            }
        }

        if (coordinateId) {
            if (typeof coordinateId === 'object') {
                coordinate = CoordinateLogic.getInstance().convertToApiResponse(
                    coordinateId as CoordinateDocumentModel
                );
            } else {
                coordinate = coordinateId as number;
            }
        }

        const priceClone: RawDataPrice = {
            value: price.value,
            currency: price.currency,
            timeUnit: price.timeUnit,
        };

        return {
            id: _id ?? null,
            transactionType:
                CommonConstant.TRANSACTION_TYPE[transactionType] ?? null,
            propertyType: CommonConstant.PROPERTY_TYPE[propertyType] ?? null,
            detailUrl,
            postDate: postDate ?? null,
            title: title ?? null,
            describe: describe ?? null,
            price: priceClone ?? null,
            acreage: acreage ?? null,
            address: address ?? null,
            others: others ?? null,
            coordinate,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

import CommonServiceLogicBase from '@common/service/common.service.logic.base';
import CommonConstant from '@common/common.constant';
import RawDataModel from './raw-data.model';
import {
    DetailUrlApiModel,
    DetailUrlDocumentModel,
} from '../detail-url/detail-url.interface';
import {
    CoordinateApiModel,
    CoordinateDocumentModel,
} from '../coordinate/coordinate.interface';
import CoordinateLogic from '../coordinate/coordinate.logic';
import DetailUrlLogic from '../detail-url/detail-url.logic';
import {
    RawDataApiModel,
    RawDataDocumentModel,
    RawDataLogicInterface,
} from './raw-data.interface';

export default class RawDataLogic
    extends CommonServiceLogicBase<RawDataDocumentModel, RawDataApiModel>
    implements RawDataLogicInterface {
    private static instance: RawDataLogic;

    constructor() {
        super(RawDataModel);
    }

    /**
     * @return {RawDataLogic}
     */
    public static getInstance(): RawDataLogic {
        if (!this.instance) {
            this.instance = new RawDataLogic();
        }

        return this.instance;
    }

    /**
     * @param {string} propertyTypeData
     *
     * @return {number} index
     */
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

    /**
     * @param {object | undefined} conditions
     *
     * @return {number}
     */
    public async countDocumentsWithConditions(
        conditions?: object
    ): Promise<number> {
        return RawDataModel.countDocuments(conditions || {}).exec();
    }

    /**
     * @param {RawDataDocumentModel}
     *
     * @return {RawDataApiModel}
     */
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
        isGrouped,
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

        const priceClone: {
            value: number;
            currency: string;
            timeUnit: { id: number; wording: string[] };
        } = {
            value: price.value,
            currency: price.currency,
            timeUnit: CommonConstant.PRICE_TIME_UNIT[price.timeUnit],
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
            isGrouped: isGrouped ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

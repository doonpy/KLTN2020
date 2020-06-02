import CommonServiceLogicBase from '@common/service/common.service.logic.base';
import GroupedDataModel from './grouped-data.model';
import { GroupedDataApiModel, GroupedDataDocumentModel } from './grouped-data.interface';
import RawDataLogic from '../raw-data/raw-data.logic';
import { RawDataApiModel, RawDataDocumentModel } from '../raw-data/raw-data.interface';

export default class GroupedDataLogic extends CommonServiceLogicBase<
    GroupedDataDocumentModel,
    GroupedDataApiModel
> {
    private static instance: GroupedDataLogic;

    constructor() {
        super(GroupedDataModel);
    }

    /**
     * @return {GroupedDataLogic}
     */
    public static getInstance(): GroupedDataLogic {
        if (!this.instance) {
            this.instance = new GroupedDataLogic();
        }

        return this.instance;
    }

    /**
     * @param {GroupedDataDocumentModel}
     *
     * @return {GroupedDataApiModel}
     */
    public convertToApiResponse({
        _id,
        items,
        cTime,
        mTime,
    }: GroupedDataDocumentModel): GroupedDataApiModel {
        const itemsConverted: (RawDataApiModel | number | null)[] = items.map(
            (item): RawDataApiModel | number | null => {
                if (item) {
                    if (typeof item === 'object') {
                        return RawDataLogic.getInstance().convertToApiResponse(
                            item as RawDataDocumentModel
                        );
                    }
                    return item as number;
                }

                return null;
            }
        );

        return {
            id: _id ?? null,
            items: itemsConverted,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

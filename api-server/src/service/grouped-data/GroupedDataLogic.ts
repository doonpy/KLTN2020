import ServiceLogicBase from '@service/ServiceLogicBase';
import Model from './model';
import { GroupedDataApiModel, GroupedDataDocumentModel } from './interface';
import RawDataLogic from '../raw-data/RawDataLogic';
import { RawDataApiModel, RawDataDocumentModel } from '../raw-data/interface';

export default class GroupedDataLogic extends ServiceLogicBase<
    GroupedDataDocumentModel,
    GroupedDataApiModel
> {
    private static instance: GroupedDataLogic;

    constructor() {
        super(Model);
    }

    public static getInstance(): GroupedDataLogic {
        if (!this.instance) {
            this.instance = new GroupedDataLogic();
        }

        return this.instance;
    }

    public convertToApiResponse({
        _id,
        items,
        cTime,
        mTime,
    }: GroupedDataDocumentModel): GroupedDataApiModel {
        const itemsConverted: Array<
            RawDataApiModel | number | null
        > = items.map((item): RawDataApiModel | number | null => {
            if (item) {
                if (typeof item === 'object') {
                    return RawDataLogic.getInstance().convertToApiResponse(
                        item as RawDataDocumentModel
                    );
                }
                return item as number;
            }

            return null;
        });

        return {
            id: _id ?? null,
            items: itemsConverted,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}

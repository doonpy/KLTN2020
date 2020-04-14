import GroupedDataLogic from './grouped-data.logic';
import GroupedDataController from './grouped-data.controller';
import GroupedDataModelInterface from './grouped-data.model.interface';
import GroupedDataApiInterface from './grouped-data.api.interface';

export namespace GroupedData {
    export const Logic = GroupedDataLogic;
    export type Logic = GroupedDataLogic;

    export const Controller = GroupedDataController;
    export type Controller = GroupedDataController;

    export type DocumentInterface = GroupedDataModelInterface;
    export type ApiInterface = GroupedDataApiInterface;
}

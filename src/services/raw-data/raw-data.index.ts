import RawDataLogic from './raw-data.logic';
import RawDataController from './raw-data.controller';
import { RawDataConstant } from './raw-data.constant';
import RawDataModelInterface from './raw-data.model.interface';
import RawDataApiInterface from './raw-data.api.interface';

export namespace RawData {
    export const Logic = RawDataLogic;
    export type Logic = RawDataLogic;

    export const Controller = RawDataController;
    export type Controller = RawDataController;

    export const Constant = RawDataConstant;

    export type DocumentInterface = RawDataModelInterface;
    export type ApiInterface = RawDataApiInterface;
}

import CoordinateLogic from './coordinate.logic';
import CoordinateModelInterface from './coordinate.model.interface';
import CoordinateApiInterface from './coordinate.api.interface';

export namespace Coordinate {
    export const Logic = CoordinateLogic;
    export type Logic = CoordinateLogic;

    export type DocumentInterface = CoordinateModelInterface;
    export type ApiInterface = CoordinateApiInterface;
}

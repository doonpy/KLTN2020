import PatternLogic from './pattern.logic';
import PatternController from './pattern.controller';
import PatternModelInterface from './pattern.model.interface';
import PatternApiInterface from './pattern.api.interface';

export namespace Pattern {
    export const Logic = PatternLogic;
    export type Logic = PatternLogic;

    export const Controller = PatternController;
    export type Controller = PatternController;

    export type DocumentInterface = PatternModelInterface;
    export type ApiInterface = PatternApiInterface;
}

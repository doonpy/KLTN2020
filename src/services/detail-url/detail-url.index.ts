import DetailUrlLogic from './detail-url.logic';
import DetailUrlController from './detail-url.controller';
import DetailUrlModelInterface from './detail-url.model.interface';

export namespace DetailUrl {
    export const Logic = DetailUrlLogic;
    export type Logic = DetailUrlLogic;

    export const Controller = DetailUrlController;
    export type Controller = DetailUrlController;

    export type DocumentInterface = DetailUrlModelInterface;
}

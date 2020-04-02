import DetailUrlLogic from './detail-url.logic';
import DetailUrlController from './detail-url.controller';
import DetailUrlModelInterface from './detail-url.model.interface';
import DetailUrlApiInterface from './detail-url.api.interface';

export namespace DetailUrl {
    export const Logic = DetailUrlLogic;
    export type Logic = DetailUrlLogic;

    export const Controller = DetailUrlController;
    export type Controller = DetailUrlController;

    export type DocumentInterface = DetailUrlModelInterface;
    export type ApiInterface = DetailUrlApiInterface;
}

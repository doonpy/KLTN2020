import CatalogController from './catalog.controller';
import CatalogLogic from './catalog.logic';
import CatalogModelInterface from './catalog.model.interface';
import CatalogApiInterface from './catalog.api.interface';

export namespace Catalog {
    export const Logic = CatalogLogic;
    export type Logic = CatalogLogic;

    export const Controller = CatalogController;
    export type Controller = CatalogController;

    export type DocumentInterface = CatalogModelInterface;
    export type ApiInterface = CatalogApiInterface;
}

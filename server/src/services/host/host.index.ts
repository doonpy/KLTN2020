import HostLogic from './host.logic';
import HostController from './host.controller';
import HostModelInterface from './host.model.interface';
import HostApiInterface from './host.api.interface';

export namespace Host {
    export const Logic = HostLogic;
    export type Logic = HostLogic;

    export const Controller = HostController;
    export type Controller = HostController;

    export type DocumentInterface = HostModelInterface;
    export type ApiInterface = HostApiInterface;
}

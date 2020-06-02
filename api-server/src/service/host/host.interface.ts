import {
    CommonApiModel,
    CommonDocumentModel,
    CommonLogicBaseInterface,
} from '@common/service/common.service.interface';

export interface HostApiModel extends CommonApiModel {
    name: string | null;
    domain: string | null;
}

export interface HostDocumentModel extends CommonDocumentModel {
    name: string;
    domain: string;
}

export interface HostLogicInterface extends CommonLogicBaseInterface<HostDocumentModel, HostApiModel> {
    /**
     * @param {string} domain
     *
     * @return {HostDocumentModel}
     */
    getByDomain(domain: string): Promise<HostDocumentModel>;
}

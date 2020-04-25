import {
    CommonDocumentModel,
    CommonApiModel,
    CommonLogicBaseInterface,
} from '../../common/service/common.service.interface';

export interface HostApiModel extends CommonApiModel {
    name: string | null;
    domain: string | null;
}

export interface HostDocumentModel extends CommonDocumentModel {
    name: string;
    domain: string;
}

export interface HostLogicInterface extends CommonLogicBaseInterface {
    /**
     * @param {string} domain
     *
     * @return {HostDocumentModel}
     */
    getByDomain(domain: string): Promise<HostDocumentModel>;

    /**
     * @param {string} domain
     *
     * @return {boolean}
     */
    isExistsWithDomain(domain: string): Promise<boolean>;

    /**
     * @param {string} domain
     * @param {boolean | undefined} isNot
     *
     * @return {Promise<void>}
     */
    checkExistsWithDomain(domain: string, isNot?: boolean): Promise<void>;
}

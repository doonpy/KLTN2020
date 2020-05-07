import { CommonApiModel } from '../../common/service/common.service.interface';

export interface HostApiModel extends CommonApiModel {
    name: string | null;
    domain: string | null;
}

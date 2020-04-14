import { Host } from '../host/host.index';
import { Pattern } from '../pattern/pattern.index';

export default interface CatalogApiInterface {
    id: number | null;
    title: string | null;
    url: string | null;
    locator: {
        detailUrl: string;
        pageNumber: string;
    } | null;
    host: Host.ApiInterface | null;
    pattern: Pattern.ApiInterface | null;
    createAt: string | null;
    updateAt: string | null;
}

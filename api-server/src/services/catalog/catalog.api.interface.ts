import HostApiInterface from '../host/host.api.interface';
import PatternApiInterface from '../pattern/pattern.api.interface';

export default interface CatalogApiInterface {
    id: number | null;
    title: string | null;
    url: string | null;
    locator: {
        detailUrl: string;
        pageNumber: string;
    } | null;
    host: HostApiInterface | null;
    pattern: PatternApiInterface | null;
    createAt: string | null;
    updateAt: string | null;
}

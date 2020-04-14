import { RawData } from '../raw-data/raw-data.index';

export default interface GroupedDataApiInterface {
    id: number | null;
    items: Array<RawData.ApiInterface> | null | Array<number>;
    createAt: string | null;
    updateAt: string | null;
}

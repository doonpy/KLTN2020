import RawDataApiInterface from '../raw-data/raw-data.api.interface';

export default interface GroupedDataApiInterface {
    id: number | null;
    items: RawDataApiInterface[] | null | number[];
    createAt: string | null;
    updateAt: string | null;
}

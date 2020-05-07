export interface CommonQueryParams {
    limit?: number;
    offset?: number;
    populate?: 0 | 1;
    keyword?: string;
}

export interface CommonApiModel {
    id: number | null;
    createAt: string | null;
    updateAt: string | null;
}

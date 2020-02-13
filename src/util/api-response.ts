import { Response } from 'express';
import { Constant } from '../util/definition/constant';

class ApiResponse {
    protected statusCode: number = -1;
    protected body: any = {};

    constructor() {}

    /**
     * Send normal response
     *
     * @param statusCode
     * @param resourceName
     * @param resource
     * @param res
     */
    public sendResponse(
        statusCode: number,
        resource: any,
        res: Response
    ): void {
        this.statusCode = statusCode;
        this.body = resource;

        this.send(res);
    }

    /**
     * Send response
     *
     * @param res
     */
    private send(res: Response): void {
        if (this.statusCode === Constant.RESPONSE_STATUS_CODE.NO_CONTENT) {
            res.status(this.statusCode).json();
        } else {
            res.status(this.statusCode).json(this.body);
        }
    }
}

export default ApiResponse;

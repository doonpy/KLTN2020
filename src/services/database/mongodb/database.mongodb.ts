import mongoose from 'mongoose';
import { Exception } from '../../exception/exception.index';

import { DatabaseFailedResponseRootCause } from '../database.failed-response';
import { Common } from '../../../common/common.index';

export default class DatabaseMongodb {
    private _dbHost: any = process.env.DB_HOST;
    private _dbPort: any = process.env.DB_PORT;
    private _dbName: any = process.env.DB_NAME;
    private _username: any = process.env.DB_USERNAME;
    private _password: any = process.env.DB_PASS;

    constructor() {}

    /**
     * Open connection to database
     */
    public async connect(): Promise<void> {
        const connString: string = `mongodb://${this._username}:${this._password}@${this._dbHost}:${this._dbPort}/${this._dbName}?authSource=admin`;
        try {
            await mongoose.connect(connString, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
                useCreateIndex: true,
            });
        } catch (error) {
            new Exception.Api(
                Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                DatabaseFailedResponseRootCause.DB_RC_1
            );
        }
    }

    /**
     * Disconnect to database
     */
    public disconnect() {
        mongoose.disconnect().then(() => {});
    }
}

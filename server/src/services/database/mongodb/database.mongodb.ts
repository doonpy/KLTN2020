import mongoose from 'mongoose';
import { Exception } from '../../exception/exception.index';
import { DatabaseFailedResponseRootCause } from '../database.failed-response';
import { ResponseStatusCode } from '../../../common/common.response-status.code';

export default class DatabaseMongodb {
    private readonly dbHost: string = process.env.DB_HOST || '';
    private readonly dbPort: string = process.env.DB_PORT || '';
    private readonly dbName: string = process.env.DB_NAME || '';
    private readonly username: string = process.env.DB_USERNAME || '';
    private readonly password: string = process.env.DB_PASS || '';
    private readonly authSource: string = process.env.DB_AUTH_SOURCE || '';

    constructor() {
        if (process.env.NODE_ENV === 'development') {
            this.dbHost = process.env.DB_HOST_DEV || '';
        }
    }

    /**
     * Open connection to database
     */
    public async connect(): Promise<void> {
        const connString: string = `mongodb://${this.dbHost}:${this.dbPort}`;
        try {
            await mongoose.connect(connString, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
                useCreateIndex: true,
                auth: {
                    user: this.username,
                    password: this.password,
                },
                authSource: this.authSource,
                dbName: this.dbName,
            });
        } catch (error) {
            new Exception.Customize(
                ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                DatabaseFailedResponseRootCause.DB_RC_1
            ).raise();
        }
    }

    /**
     * Disconnect to database
     */
    public async disconnect() {
        try {
            await mongoose.disconnect();
        } catch (e) {
            throw e;
        }
    }
}

import { connect, Mongoose, set, ConnectionOptions } from 'mongoose';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import DatabaseWording from '@database/database.wording';
import { upperCaseFirstCharacter } from '@util/helper/string';

export default class DatabaseMongodb {
    private static instance: DatabaseMongodb | undefined;

    public connection: Mongoose | undefined;

    private readonly dbHost: string | undefined;

    private readonly dbPort: string | undefined;

    private readonly dbName: string | undefined;

    private readonly authDb: string | undefined;

    private readonly username: string | undefined;

    private readonly password: string | undefined;

    constructor() {
        this.dbHost = process.env.DB_HOST ?? '';
        this.dbPort = process.env.DB_PORT ?? '';
        this.dbName = process.env.DB_NAME ?? '';
        this.username = process.env.DB_USERNAME ?? '';
        this.password = process.env.DB_PASS ?? '';
        this.authDb = process.env.DB_AUTH_DB ?? '';

        if (process.env.NODE_ENV !== 'production') {
            set('debug', (Number(process.env.DB_DEBUG_MODE) ?? 0) === 1);
        }
    }

    /**
     * Get instance
     */
    public static getInstance(): DatabaseMongodb {
        if (!this.instance) {
            this.instance = new DatabaseMongodb();
        }

        return this.instance;
    }

    /**
     * @param connString
     * @param options
     * @private
     */
    private async _connect(
        connString: string,
        options: ConnectionOptions
    ): Promise<void> {
        this.connection = await connect(connString, options);
    }

    /**
     * Open connection to database
     */
    public async connect(): Promise<void> {
        const connString = `mongodb://${this.dbHost}:${this.dbPort}/${this.dbName}`;
        const options: ConnectionOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
            connectTimeoutMS: 10000,
        };

        if (process.env.NODE_ENV === 'production') {
            options.user = this.username;
            options.pass = this.password;
            options.authSource = this.authDb;
        }

        try {
            await this._connect(connString, options);
        } catch (error) {
            new ConsoleLog(
                ConsoleConstant.Type.ERROR,
                upperCaseFirstCharacter(DatabaseWording.CAUSE.DBC_1[1])
            ).show();
        }
    }
}

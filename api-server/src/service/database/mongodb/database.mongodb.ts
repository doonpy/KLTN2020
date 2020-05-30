import { connect, Mongoose, set } from 'mongoose';
import ConsoleLog from '@util/console/console.log';
import ConsoleConstant from '@util/console/console.constant';

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
        if (process.env.NODE_ENV === 'production') {
            this.dbHost = process.env.PROD_DB_HOST ?? '';
            this.dbPort = process.env.PROD_DB_PORT ?? '';
            this.dbName = process.env.PROD_DB_NAME ?? '';
            this.username = process.env.PROD_DB_USERNAME ?? '';
            this.password = process.env.PROD_DB_PASS ?? '';
            this.authDb = process.env.PROD_DB_AUTH_DB ?? '';
        } else {
            this.dbHost = process.env.DEV_DB_HOST ?? '';
            this.dbPort = process.env.DEV_DB_PORT ?? '';
            this.dbName = process.env.DEV_DB_NAME ?? '';
            set('debug', (Number(process.env.DEV_DB_DEBUG_MODE) ?? 0) === 1);
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
     * Open connection to database
     */
    public async connect(): Promise<void> {
        const connString = `mongodb://${this.dbHost}:${this.dbPort}/${this.dbName}`;
        const options: { [key: string]: any } = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        };

        if (process.env.NODE_ENV === 'production') {
            options.auth = { user: this.username, password: this.password };
            options.authSource = this.authDb;
        }

        this.connection = await connect(connString, options);
        new ConsoleLog(ConsoleConstant.Type.INFO, `Successful connection to (DB: ${this.dbName}).`).show();
    }
}

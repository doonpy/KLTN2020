import { connect, Mongoose, set } from 'mongoose';
import ConsoleLog from '../../../util/console/console.log';
import ConsoleConstant from '../../../util/console/console.constant';

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
            this.dbHost = process.env.DB_HOST ?? '';
            this.dbPort = process.env.DB_PORT ?? '';
            this.dbName = process.env.DB_NAME ?? '';
            this.username = process.env.DB_USERNAME ?? '';
            this.password = process.env.DB_PASS ?? '';
            this.authDb = process.env.DB_AUTH_DB ?? '';
        } else {
            this.dbHost = process.env.DB_HOST_DEV ?? '';
            this.dbPort = process.env.DB_PORT_DEV ?? '';
            this.dbName = process.env.DB_NAME_DEV ?? '';
            this.username = process.env.DB_USERNAME_DEV ?? '';
            this.password = process.env.DB_PASS_DEV ?? '';
            this.authDb = process.env.DB_AUTH_DB_DEV ?? '';
            set('debug', (process.env.DB_DEBUG_MODE ?? 1) === 1);
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
        const connString = `mongodb://${this.dbHost as string}:${this.dbPort as string}`;
        this.connection = await connect(connString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: true,
            useCreateIndex: true,
            auth: {
                user: this.username as string,
                password: this.password as string,
            },
            authSource: this.authDb,
            dbName: this.dbName,
        });
        new ConsoleLog(ConsoleConstant.Type.INFO, `Successful connection to (DB: ${this.dbName}).`).show();
    }
}

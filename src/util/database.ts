import mongoose from 'mongoose';

class DatabaseConnection {
    private _dbHost: any = process.env.DB_HOST;
    private _dbPort: any = process.env.DB_PORT;
    private _dbName: any = process.env.DB_NAME;
    private _username: any = process.env.DB_USERNAME;
    private _password: any = process.env.DB_PASS;

    constructor() {}

    /**
     * Open connection to database
     */
    public connect() {
        return new Promise((resolve, reject) => {
            const connString: string = `mongodb://${this._username}:${this._password}@${this._dbHost}:${this._dbPort}/${this._dbName}?authSource=admin`;

            mongoose
                .connect(connString, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useFindAndModify: false,
                    useCreateIndex: true,
                })
                .then(resolve)
                .catch(error => {
                    reject(error);
                });
        });
    }

    /**
     * Disconnect to database
     */
    public disconnect() {
        mongoose.disconnect().then(() => {});
    }
}

export default DatabaseConnection;

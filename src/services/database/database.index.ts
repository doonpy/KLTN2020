import {
    DatabaseFailedResponseMessage,
    DatabaseFailedResponseRootCause,
} from './database.failed-response';
import DatabaseMongodb from './mongodb/database.mongodb';

export namespace Database {
    export const FailedResponse = {
        Message: DatabaseFailedResponseMessage,
        RootCause: DatabaseFailedResponseRootCause,
    };

    export const MongoDb = DatabaseMongodb;
    export type MongoDb = DatabaseMongodb;
}

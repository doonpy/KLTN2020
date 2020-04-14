import { DatabaseFailedResponseMessage, DatabaseFailedResponseRootCause } from './database.failed-response';
import DatabaseMongodb from './mongodb/database.mongodb';

export const Database = {
    FailedResponse: {
        Message: DatabaseFailedResponseMessage,
        RootCause: DatabaseFailedResponseRootCause,
    },
    MongoDb: DatabaseMongodb,
};

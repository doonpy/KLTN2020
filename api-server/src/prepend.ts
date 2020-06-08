import 'module-alias/register';
import DatabaseMongodb from '@database/mongodb/database.mongodb';
import { config as dotEnvConfig } from 'dotenv';

const initEnvironmentVariables = (): void => {
    if (process.env.NODE_ENV !== 'production') {
        dotEnvConfig({ path: process.cwd() + '/api-server/src/dev.env' });
    }
};

(async (): Promise<void> => {
    initEnvironmentVariables();
    await DatabaseMongodb.getInstance().connect();
})();

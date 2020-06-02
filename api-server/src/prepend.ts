import DatabaseMongodb from '@root/database/mongodb/database.mongodb';
import EnvironmentVariables from '@root/env';

const initEnvironmentVariables = (): void => {
    if (process.env.NODE_ENV === 'production') {
        return;
    }

    Object.keys(EnvironmentVariables).forEach((key): void => {
        process.env[key] = (EnvironmentVariables as { [key: string]: any })[
            key
        ] as string;
    });
};

(async (): Promise<void> => {
    initEnvironmentVariables();
    await DatabaseMongodb.getInstance().connect();
})();

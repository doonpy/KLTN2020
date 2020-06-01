import initEnvironmentVariables from '@util/environment/environment';
import DatabaseMongodb from '@root/database/mongodb/database.mongodb';

(async (): Promise<void> => {
    initEnvironmentVariables();
    await DatabaseMongodb.getInstance().connect();
})();

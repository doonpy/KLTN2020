import initEnvironmentVariables from '@util/environment/environment';
import DatabaseMongodb from '@service/database/mongodb/database.mongodb';

(async (): Promise<void> => {
    initEnvironmentVariables();
    await DatabaseMongodb.getInstance().connect();
})();

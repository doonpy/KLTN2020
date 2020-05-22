import fs from 'fs';
import EnvironmentVariables from '../../env';

export default (): void => {
    Object.keys(EnvironmentVariables).forEach((key): void => {
        if (new RegExp(/^DEV_/).test(key) && process.env.NODE_ENV === 'production') {
            return;
        }

        if (key === 'PROD_DB_PASS' && process.env.NODE_ENV === 'production') {
            process.env.PROD_DB_PASS = fs.readFileSync('./tools/docker/database/secrets', { encoding: 'utf-8' });
            return;
        }

        process.env[key] = (EnvironmentVariables as { [key: string]: string | number | boolean })[key] as string;
    });
};

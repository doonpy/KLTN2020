import { EnvironmentVariables } from '../../env';

export const initEnv = (): void => {
    Object.keys(EnvironmentVariables).forEach((key): void => {
        if (new RegExp(/_DEV$/).test(key) && process.env.NODE_ENV === 'production') {
            return;
        }
        process.env[key] = EnvironmentVariables[key] as string;
    });
};

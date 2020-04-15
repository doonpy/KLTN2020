import { EnvironmentVariables } from '../../env';

export const initEnv = (): void => {
    Object.keys(EnvironmentVariables).forEach((key): void => {
        process.env[key] = EnvironmentVariables[key] as string;
    });
};

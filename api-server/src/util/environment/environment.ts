import EnvironmentVariables from '../../env';

export default (): void => {
    Object.keys(EnvironmentVariables).forEach((key): void => {
        if (new RegExp(/_DEV$/).test(key) && process.env.NODE_ENV === 'production') {
            return;
        }
        process.env[key] = (EnvironmentVariables as { [key: string]: string | number | boolean })[key] as string;
    });
};

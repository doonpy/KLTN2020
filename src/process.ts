import sendRequest from './util/send-request';

export const runBackgroundJobs = (): void => {
    sendRequest('https://g2asdaf2oogle.com/')
        .then((body: string): void => {
            console.log(body);
        })
        .catch((error: Error): void => {
            console.log(error);
        });
};

runBackgroundJobs();

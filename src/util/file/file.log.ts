import fs from 'fs';
import FileBase from './file.base';

export default class FileLog extends FileBase {
    private folderPath: string = '';
    private readonly dateFolder: string = '';
    private fileName: string = '';
    private content: string = '';
    private extension: string = 'log';

    private readonly LOG_ROOT_FOLDER: string = 'logs';
    private readonly ERROR_LOG_ROOT_FOLDER: string = 'error';
    private readonly PREFIX: string = 'log_';
    private readonly FULL_HOST_URI: string | any = `${process.env.SERVER_PROTOCOL ||
        'http://'}${process.env.SERVER_URI || '127.0.0.1'}${
        process.env.SERVER_PORT ? `:${process.env.SERVER_PORT}` : ':3000'
    }`;

    constructor() {
        super();
        let currentDate: Date = new Date();
        this.dateFolder = `${currentDate.getUTCFullYear()}-${currentDate.getUTCMonth() +
            1}-${currentDate.getUTCDate()}`;
        this.initHeader();
    }

    /**
     * Initialize log folder if not exists.
     */
    public initLogFolder(folderPath: string, extension: string = ''): void {
        this.folderPath = folderPath;
        if (extension) {
            this.extension = extension;
        }

        this.createFolder(
            this.PUBLIC_FOLDER_PATH +
                '/' +
                this.LOG_ROOT_FOLDER +
                '/' +
                this.folderPath +
                '/' +
                this.dateFolder
        );
        this.createFolder(
            this.PUBLIC_FOLDER_PATH +
                '/' +
                this.LOG_ROOT_FOLDER +
                '/' +
                this.ERROR_LOG_ROOT_FOLDER +
                '/' +
                this.dateFolder
        );
    }

    /**
     * Export log file
     */
    public exportFile(): void {
        try {
            this.createFile(this.PUBLIC_FOLDER_PATH + '/' + this.getFullPath(), this.content, {
                encoding: 'utf-8',
            });
        } catch (error) {
            this.createErrorLog(error);
        }
    }

    /**
     * Create error log file.
     */
    private createErrorLog(error: Error): void {
        let content: string = `Error!\nName: ${error.name}\nMessage: ${error.message}\n Stack: ${error.stack}`;

        try {
            this.createFile(this.PUBLIC_FOLDER_PATH + '/' + this.getFullPath(true), content, {
                encoding: 'utf-8',
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create file name with current date time.
     */
    public createFileName(customizeFileName: string = ''): void {
        let currentDate: Date = new Date();
        this.fileName =
            this.PREFIX +
            customizeFileName +
            currentDate.getUTCHours() +
            currentDate.getUTCMinutes() +
            currentDate.getUTCSeconds() +
            currentDate.getUTCMilliseconds();
    }

    /**
     * @param content
     */
    public addLine(content: string): void {
        if (!content) {
            return;
        }

        this.content += content.trim() + '\n';
    }

    /**
     * Get full path of log file.
     */
    private getFullPath(isError: boolean = false): string {
        return (
            this.PUBLIC_FOLDER_PATH +
            '/' +
            this.LOG_ROOT_FOLDER +
            '/' +
            (isError ? this.ERROR_LOG_ROOT_FOLDER : this.folderPath) +
            '/' +
            this.dateFolder +
            '/' +
            this.fileName +
            '.' +
            this.extension
        );
    }

    /**
     * Get full static path of log file.
     */
    public getUrl(): string {
        return (
            this.FULL_HOST_URI +
            '/' +
            this.LOG_ROOT_FOLDER +
            '/' +
            this.folderPath +
            '/' +
            this.dateFolder +
            '/' +
            this.fileName +
            '.' +
            this.extension
        );
    }

    /**
     * Initialize header of log file
     */
    private initHeader(): void {
        let currentDate: Date = new Date();

        this.addLine(`Date: ${currentDate.toLocaleDateString()}`);
        this.addLine(`Time: ${currentDate.toLocaleTimeString()}`);
        this.addLine(`-------- DETAIL -------`);
    }

    /**
     * Initialize footer of log file
     *
     * @param contentList
     */
    public initFooter(contentList: Array<{ name: string; value: string | number }>): void {
        this.addLine(`-------- SUMMARY -------`);
        for (const item of contentList) {
            this.addLine(`-> ${item.name}: ${item.value}`);
        }
    }

    /**
     * Reset log
     */
    public resetLog(): void {
        this.content = '';
        this.initHeader();
    }
}

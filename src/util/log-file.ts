import fs from 'fs';
import { ErrorMessage } from './definition/error/message';

class LogFile {
    private folderPath: string = '';
    private readonly dateFolder: string = '';
    private fileName: string = '';
    private content: string = '';
    private extension: string = 'txt';

    private readonly LOG_ROOT_FOLDER_PATH: string = './log';
    private readonly PREFIX: string = 'log_';

    constructor() {
        let currentDate: Date = new Date();
        this.dateFolder = `${currentDate.getFullYear()}-${currentDate.getMonth() +
            1}-${currentDate.getDate()}`;
        this.createFileName();
        this.initHeader();
    }

    /**
     * Initialize log folder if not exists.
     */
    public initLogFolder(folderPath: string, extension: string): void {
        this.folderPath = folderPath;
        this.extension = extension;

        if (!fs.existsSync(this.LOG_ROOT_FOLDER_PATH)) {
            fs.mkdirSync(this.LOG_ROOT_FOLDER_PATH);
        }

        if (!fs.existsSync(this.LOG_ROOT_FOLDER_PATH + '/' + this.folderPath)) {
            fs.mkdirSync(this.LOG_ROOT_FOLDER_PATH + '/' + this.folderPath);
        }

        if (
            !fs.existsSync(
                this.LOG_ROOT_FOLDER_PATH + '/' + this.folderPath + '/' + this.dateFolder
            )
        ) {
            fs.mkdirSync(this.LOG_ROOT_FOLDER_PATH + '/' + this.folderPath + '/' + this.dateFolder);
        }
    }

    /**
     * Export log file
     */
    public exportFile(): void {
        if (!this.folderPath || !this.content) {
            this.createErrorLog(new Error(ErrorMessage.LOG.DATA_NULL));
            return;
        }

        fs.writeFileSync(this.getFullPath(), this.content, { encoding: 'utf-8' });
    }

    /**
     * Create error log file.
     */
    private createErrorLog(error: Error, extension: string = 'txt'): void {
        let content: string = `Error!\nName: ${error.name}\nMessage: ${error.message}\n Stack: ${error.stack}`;

        fs.writeFileSync(this.getFullPath(), content, {
            encoding: 'utf-8',
        });
    }

    /**
     * Create file name with current date time.
     */
    private createFileName(): void {
        let currentDate: Date = new Date();
        this.fileName =
            this.PREFIX +
            currentDate.getHours() +
            currentDate.getMinutes() +
            currentDate.getSeconds();
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
    private getFullPath(): string {
        return (
            this.LOG_ROOT_FOLDER_PATH +
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
     * Get full static path of log file.
     */
    public getFullStaticPath(): string {
        return this.folderPath + '/' + this.dateFolder + '/' + this.fileName + '.' + this.extension;
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
}

export default LogFile;

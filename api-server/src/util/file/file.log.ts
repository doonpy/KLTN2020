import FileBase from './file.base';

export default class FileLog extends FileBase {
    private folderPath = '';

    private readonly dateFolder: string = '';

    private fileName = '';

    private content = '';

    private extension = 'log';

    private readonly LOG_ROOT_FOLDER: string = 'logs';

    private readonly ERROR_LOG_ROOT_FOLDER: string = 'error';

    private readonly PREFIX: string = 'log_';

    constructor() {
        super();
        const currentDate: Date = new Date();
        this.dateFolder = `${currentDate.getUTCFullYear()}-${
            currentDate.getUTCMonth() + 1
        }-${currentDate.getUTCDate()}`;
        this.initHeader();
    }

    /**
     * Initialize log folder if not exists.
     */
    public initLogFolder(folderPath: string, extension = ''): void {
        this.folderPath = folderPath;
        if (extension) {
            this.extension = extension;
        }

        this.createFolder(`${this.PUBLIC_FOLDER_PATH}/${this.LOG_ROOT_FOLDER}/${this.folderPath}/${this.dateFolder}`);
        this.createFolder(
            `${this.PUBLIC_FOLDER_PATH}/${this.LOG_ROOT_FOLDER}/${this.ERROR_LOG_ROOT_FOLDER}/${this.dateFolder}`
        );
    }

    /**
     * Export log file
     */
    public exportFile(): void {
        try {
            this.createFile(this.getFullPath(), this.content, {
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
        const content = `Error!\nName: ${error.name}\nMessage: ${error.message}\n Stack: ${error.stack}`;
        this.createFile(this.getFullPath(true), content, {
            encoding: 'utf-8',
        });
    }

    /**
     * Create file name with current date time.
     */
    public createFileName(customizeFileName = ''): void {
        const currentDate: Date = new Date();
        this.fileName = `${
            this.PREFIX + customizeFileName + currentDate.getUTCHours()
        }-${currentDate.getUTCMinutes()}-${currentDate.getUTCSeconds()}`;
    }

    /**
     * @param content
     */
    public addLine(content: string): void {
        if (!content) {
            return;
        }

        this.content += `${content.trim()}\n`;
    }

    /**
     * Get full path of log file.
     */
    private getFullPath(isError = false): string {
        return `${this.PUBLIC_FOLDER_PATH}/${this.LOG_ROOT_FOLDER}/${
            isError ? this.ERROR_LOG_ROOT_FOLDER : this.folderPath
        }/${this.dateFolder}/${this.fileName}.${this.extension}`;
    }

    /**
     * Initialize header of log file
     */
    private initHeader(): void {
        const currentDate: Date = new Date();

        this.addLine(`Date: ${currentDate.toLocaleDateString()}`);
        this.addLine(`Time: ${currentDate.toLocaleTimeString()}`);
        this.addLine(`-------- DETAIL -------`);
    }

    /**
     * Initialize footer of log file
     *
     * @param contentList
     */
    public initFooter(contentList: { name: string; value: string | number }[]): void {
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

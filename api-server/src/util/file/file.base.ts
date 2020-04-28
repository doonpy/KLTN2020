import fs from 'fs';
import FileErrorResponse from './file.error-response';
import StringHandler from '../helper/string-handler';

export default class FileBase {
    protected readonly PUBLIC_FOLDER_PATH: string = process.env.PUBLIC_FOLDER_PATH || './public';

    /**
     * Check path is existed. The 'path' must start from content root.
     *
     * @param path
     */
    public isPathExisted(path: string): boolean {
        return fs.existsSync(path);
    }

    /**
     * Create folder. 'folderPath' do not have '.' or '..'
     *
     * @param folderPath
     */
    public createFolder(folderPath: string): void {
        let pathTracker = '';

        for (const path of folderPath.split('/')) {
            pathTracker += `${path}/`;
            if (this.isPathExisted(pathTracker)) {
                continue;
            }
            fs.mkdirSync(pathTracker);
        }
    }

    /**
     * Write file
     *
     * @param filePath
     * @param content
     * @param options
     */
    public createFile(filePath: string, content: string, options: object): void {
        fs.writeFileSync(filePath, content, options);
    }

    /**
     * Read file
     *
     * @param filePath
     */
    public readFile(filePath: string): string {
        if (!this.isPathExisted(filePath)) {
            throw Error(StringHandler.replaceString(FileErrorResponse.Message.FILE_ERR_3, [filePath]));
        }
        return fs.readFileSync(filePath, { encoding: 'utf-8' });
    }
}

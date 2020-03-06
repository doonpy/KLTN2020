import FileLog from './file.log';
import FileBase from './file.base';

export namespace File {
    export const Log = FileLog;
    export type Log = FileLog;

    export const Base = FileBase;
    export type Base = FileBase;
}

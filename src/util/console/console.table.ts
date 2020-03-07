import ConsoleLog from './console.log';
import { ConsoleConstant } from './console.constant';

export default class ConsoleTable {
    private readonly table: Array<any>;
    private tableName: string;
    private consoleLog: ConsoleLog;
    private readonly isSplit: boolean;

    constructor(table: Array<any>, tableName: string = '', isSplit: boolean = false) {
        this.table = table;
        this.tableName = tableName;
        this.isSplit = isSplit;
        this.consoleLog = new ConsoleLog(ConsoleConstant.Type.INFO, tableName);
    }

    /**
     * Show table
     */
    public show(): void {
        if (!this.table) {
            this.consoleLog.show();
        }
        if (!this.isSplit) {
            console.table(this.table);
        } else {
            for (const element of this.table) {
                console.table(element);
            }
        }
    }
}

import chalk from 'chalk';
import { ConsoleConstant } from './console.constant';

export default class ConsoleLog {
    private readonly _msgType: number;
    private readonly _msgContent: string;

    constructor(msgType: number, msgContent: string) {
        this._msgType = msgType !== undefined ? msgType : ConsoleConstant.Type.UNKNOWN;
        this._msgContent = msgContent || '';
    }

    /**
     * Show message in console
     *
     * @return
     */
    public show(): void {
        let prefix = chalk.bold(chalk.cyan(`[PID: ${process.pid}]`) + chalk.green(`[${new Date().toUTCString()}]`));

        switch (this._msgType) {
            case ConsoleConstant.Type.INFO:
                prefix += chalk.blue(ConsoleConstant.Tag[ConsoleConstant.Type.INFO]);
                break;
            case ConsoleConstant.Type.DEBUG:
                prefix += chalk.yellow(ConsoleConstant.Tag[ConsoleConstant.Type.DEBUG]);
                break;
            case ConsoleConstant.Type.ERROR:
                prefix += chalk.red(ConsoleConstant.Tag[ConsoleConstant.Type.ERROR]);
                break;
            default:
                prefix += chalk.gray(ConsoleConstant.Tag[ConsoleConstant.Type.UNKNOWN]);
                break;
        }

        console.log(`${prefix} ${this._msgContent}`);
    }
}

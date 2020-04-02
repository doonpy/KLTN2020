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
        let message = chalk.green(`[${new Date().toUTCString()}]`);

        switch (this._msgType) {
            case ConsoleConstant.Type.INFO:
                message += chalk.blue(ConsoleConstant.Tag[ConsoleConstant.Type.INFO]);
                break;
            case ConsoleConstant.Type.DEBUG:
                message += chalk.yellow(ConsoleConstant.Tag[ConsoleConstant.Type.DEBUG]);
                break;
            case ConsoleConstant.Type.ERROR:
                message += chalk.red(ConsoleConstant.Tag[ConsoleConstant.Type.ERROR]);
                break;
            default:
                message += chalk.gray(ConsoleConstant.Tag[ConsoleConstant.Type.UNKNOWN]);
                break;
        }

        console.log(message, this._msgContent);
    }
}

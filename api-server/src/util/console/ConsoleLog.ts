import chalk from 'chalk';
import ConsoleConstant from './constant';

export default class ConsoleLog {
    private readonly msgType: number;

    private readonly msgContent: string;

    constructor(msgType: number, msgContent: string) {
        this.msgType =
            msgType !== undefined ? msgType : ConsoleConstant.Type.UNKNOWN;
        this.msgContent = msgContent || '';
    }

    /**
     * Show message in console
     */
    public show(): void {
        let prefix = chalk.bold(
            chalk.cyan(`[PID: ${process.pid}]`) +
                chalk.green(`[${new Date().toLocaleString()}]`)
        );

        switch (this.msgType) {
            case ConsoleConstant.Type.INFO:
                prefix += chalk.blue(
                    ConsoleConstant.Tag[ConsoleConstant.Type.INFO]
                );
                break;
            case ConsoleConstant.Type.DEBUG:
                prefix += chalk.yellow(
                    ConsoleConstant.Tag[ConsoleConstant.Type.DEBUG]
                );
                break;
            case ConsoleConstant.Type.ERROR:
                prefix += chalk.red(
                    ConsoleConstant.Tag[ConsoleConstant.Type.ERROR]
                );
                break;
            default:
                prefix += chalk.gray(
                    ConsoleConstant.Tag[ConsoleConstant.Type.UNKNOWN]
                );
                break;
        }

        console.log(`${prefix} ${this.msgContent}`);
    }
}

import chalk from "chalk";
import {Constant} from "./definition/constant";
import moment = require("moment");

class MessageLog {
    private readonly _msgType: number;
    private readonly _msgContent: string;

    constructor(msgType: number, msgContent: string) {
        this._msgType = msgType || Constant.MESSAGE_TYPE.UNKNOWN;
        this._msgContent = msgContent || "";
    }

    /**
     * Show message in console
     *
     * @return
     */
    public show(): void {
        let message = `[${moment().format("L LTS")}]`;

        switch (this._msgType) {
            case Constant.MESSAGE_TYPE.INFO:
                message += chalk.blue(Constant.MESSAGE_TYPE_TXT.INFO);
                break;
            case Constant.MESSAGE_TYPE.DEBUG:
                message += chalk.yellow(Constant.MESSAGE_TYPE_TXT.INFO);
                break;
            case Constant.MESSAGE_TYPE.ERROR:
                message += chalk.red(Constant.MESSAGE_TYPE_TXT.INFO);
                break;
            default:
                message += chalk.gray(Constant.MESSAGE_TYPE_TXT.INFO);
                break;
        }

        console.log(message, this._msgContent);
    }
}

export default MessageLog;

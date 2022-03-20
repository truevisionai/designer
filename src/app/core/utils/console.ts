/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { environment } from '../../../environments/environment';

const MAX_LOG_COUNT = 500;

enum ConsoleLogType {
    info,
    warn,
    error,
}

class ConsoleLog {

    public time = new Date();

    constructor ( public type: ConsoleLogType, public message: any, public counter = 0 ) { }

    get icon () {

        switch ( this.type ) {

            case ConsoleLogType.info:
                return 'info';
                break;

            case ConsoleLogType.warn:
                return 'warn';
                break;

            case ConsoleLogType.error:
                return 'error';
                break;

            default:
                return 'info';
                break;
        }

    }

}

export class TvConsole {

    static logs: ConsoleLog[] = [];

    static get lastLog () { return this.logs[ this.logs.length - 1 ]; }

    static clear () {

        this.logs.splice( 0, this.logs.length );

    }

    static info ( message: string ) {

        // if same message is being printed then just increase the counter
        if ( this.logs.length > 0 && this.lastLog.type === ConsoleLogType.info && this.lastLog.message === message ) {

            this.lastLog.counter += 1;

            this.lastLog.time = new Date();

        } else {

            this.logs.unshift( new ConsoleLog( ConsoleLogType.info, message ) );

        }

        if ( this.logs.length > MAX_LOG_COUNT ) this.logs.pop();
    }


    static warn ( message: string ) {

        // if same message is being printed then just increase the counter
        if ( this.logs.length > 0 && this.lastLog.type === ConsoleLogType.warn && this.lastLog.message === message ) {

            this.lastLog.counter += 1;

            this.lastLog.time = new Date();

        } else {

            this.logs.unshift( new ConsoleLog( ConsoleLogType.warn, message ) );

        }

        if ( this.logs.length > MAX_LOG_COUNT ) this.logs.pop();

    }


    static error ( message: string ) {

        // if same message is being printed then just increase the counter
        if ( this.logs.length > 0 && this.lastLog.type === ConsoleLogType.error && this.lastLog.message === message ) {

            this.lastLog.counter += 1;

            this.lastLog.time = new Date();

        } else {

            this.logs.unshift( new ConsoleLog( ConsoleLogType.error, message ) );

        }

        if ( this.logs.length > MAX_LOG_COUNT ) this.logs.pop();

    }
}

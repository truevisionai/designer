/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { environment } from '../../../environments/environment';

enum ConsoleMessageType {
    info,
    warn,
    error,
}

class ConsoleMessage {
    constructor ( public type: ConsoleMessageType, public message: any, public counter = 0 ) { }
}

export class TvConsole {

    static messages: ConsoleMessage[] = [];

    static get lastMessage () { return this.messages[ this.messages.length - 1 ]; }

    static clear () {

        this.messages.splice( 0, this.messages.length );

    }

    static info ( message: string ) {

        // if same message is being printed then just increase the counter
        if ( this.lastMessage.type === ConsoleMessageType.info && this.lastMessage.message === message ) {

            this.lastMessage.counter += 1;

        } else {

            this.messages.push( new ConsoleMessage( ConsoleMessageType.info, message ) );

        }
    }


    static warn ( message: string ) {

        // if same message is being printed then just increase the counter
        if ( this.lastMessage.type === ConsoleMessageType.warn && this.lastMessage.message === message ) {

            this.lastMessage.counter += 1;

        } else {

            this.messages.push( new ConsoleMessage( ConsoleMessageType.warn, message ) );

        }

    }


    static error ( message: string ) {

        // if same message is being printed then just increase the counter
        if ( this.lastMessage.type === ConsoleMessageType.error && this.lastMessage.message === message ) {

            this.lastMessage.counter += 1;

        } else {

            this.messages.push( new ConsoleMessage( ConsoleMessageType.error, message ) );

        }

    }
}

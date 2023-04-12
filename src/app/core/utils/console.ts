/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

const MAX_LOG_COUNT = 500;

enum TvLogType {
	info,
	warn,
	error,
}

class TvLog {

	public time = new Date();

	constructor ( public type: TvLogType, public message: any, public counter = 0 ) {
	}

	get icon () {

		switch ( this.type ) {

			case TvLogType.info:
				return 'info';
				break;

			case TvLogType.warn:
				return 'warn';
				break;

			case TvLogType.error:
				return 'error';
				break;

			default:
				return 'info';
				break;
		}

	}

}

export class TvConsole {

	static logs: TvLog[] = [];

	static get lastLog () {
		return this.logs[ this.logs.length - 1 ];
	}

	static clear () {

		this.logs.splice( 0, this.logs.length );

	}

	static info ( message: string ) {

		// if same message is being printed then just increase the counter
		if ( this.logs.length > 0 && this.lastLog.type === TvLogType.info && this.lastLog.message === message ) {

			this.lastLog.counter += 1;

			this.lastLog.time = new Date();

		} else {

			this.logs.unshift( new TvLog( TvLogType.info, message ) );

		}

		if ( this.logs.length > MAX_LOG_COUNT ) this.logs.pop();
	}


	static warn ( message: string ) {

		// if same message is being printed then just increase the counter
		if ( this.logs.length > 0 && this.lastLog.type === TvLogType.warn && this.lastLog.message === message ) {

			this.lastLog.counter += 1;

			this.lastLog.time = new Date();

		} else {

			this.logs.unshift( new TvLog( TvLogType.warn, message ) );

		}

		if ( this.logs.length > MAX_LOG_COUNT ) this.logs.pop();

	}


	static error ( message: string ) {

		// if same message is being printed then just increase the counter
		if ( this.logs.length > 0 && this.lastLog.type === TvLogType.error && this.lastLog.message === message ) {

			this.lastLog.counter += 1;

			this.lastLog.time = new Date();

		} else {

			this.logs.unshift( new TvLog( TvLogType.error, message ) );

		}

		if ( this.logs.length > MAX_LOG_COUNT ) this.logs.pop();

	}
}

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Environment } from './environment';

export class Log {

	// static info ( ...message: any ) {
	// 	if ( Environment.production ) return;
	// 	console.log( ...message );
	// }

	// static log ( message: string, ...optionalParams: any[] ): void {
	// 	this.writeLog( 'LOG', message, optionalParams );
	// }

	static debug ( message: string, ...optionalParams: any[] ): void {
		this.writeLog( 'DEBUG', message, optionalParams );
	}

	static info ( ...message: any ): void {
		this.writeLog( 'INFO', message, [] );
	}

	static error ( message: string, ...optionalParams: any[] ): void {
		this.writeLog( 'ERROR', message, optionalParams );
	}

	// private static logFilePath = path.join( __dirname, 'application.log' );

	private static getCallerInfo (): string {
		const stack = new Error().stack;
		if ( stack ) {
			const stackLines = stack.split( '\n' );
			// Filter out the stack lines belonging to the Logger class itself
			for ( let i = 2; i < stackLines.length; i++ ) {
				const stackLine = stackLines[ i ];
				if ( !stackLine.includes( 'Log.' ) && stackLine.includes( 'at' ) ) {
					const match = stackLine.match( /\s+at\s+(.*?)\s+\((.*):(\d+):(\d+)\)/ );
					if ( match && match[ 1 ] && match[ 2 ] && match[ 3 ] && match[ 4 ] ) {
						const methodName = match[ 1 ];
						const line = match[ 3 ];
						const column = match[ 4 ];
						return `${ methodName } (Line:${ line }:${ column })`;
					}
				}
			}
		}
		return 'unknown';
	}

	private static writeLog ( level: string, message: string, optionalParams: any[] ): void {

		if ( Environment.production ) return;

		const callerInfo = this.getCallerInfo();
		const timestamp = new Date().toISOString();
		const logMessage = `[${ timestamp }] [${ level }] ${ callerInfo } - ${ message }`;

		console.log( logMessage, ...optionalParams );

		// Write to log file
		// fs.appendFileSync( this.logFilePath, logMessage + '\n' );
		// optionalParams.forEach( param => {
		// 	if ( typeof param === 'object' ) {
		// 		fs.appendFileSync( this.logFilePath, JSON.stringify( param, null, 2 ) + '\n' );
		// 	} else {
		// 		fs.appendFileSync( this.logFilePath, param + '\n' );
		// 	}
		// } );
	}

}

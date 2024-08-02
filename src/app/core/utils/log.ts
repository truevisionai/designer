/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { StorageService } from 'app/io/storage.service';
import { Environment } from './environment';
import { TvElectronService } from 'app/services/tv-electron.service';

declare const electronFs;

const MAX_LENGTH = 1000;
const MAX_DEPTH = 1;

export class Log {

	private static logging = true;
	private static isElectron = TvElectronService.isElectronApp;

	static log ( message: string, ...optionalParams: any[] ): void {
		this.writeLog( 'LOG', message, optionalParams );
	}

	static debug ( message: string, ...optionalParams: any[] ): void {
		this.writeLog( 'DEBUG', message, optionalParams );
	}

	static info ( ...message: any ): void {
		this.writeLog( 'INFO', message, [] );
	}

	static error ( message: string, ...optionalParams: any[] ): void {
		this.writeLog( 'ERROR', message, optionalParams );
	}

	static warn ( message: string, ...optionalParams: any[] ): void {
		this.writeLog( 'WARN', message, optionalParams );
	}

	private static getCallerInfo (): string {

		const stack = new Error().stack;

		if ( stack ) {

			const stackLines = stack.split( '\n' );

			// Filter out the stack lines belonging to the Logger class itself
			for ( let i = 2; i < stackLines.length; i++ ) {

				const stackLine = stackLines[ i ];

				if ( !stackLine?.includes( 'Log.' ) && stackLine?.includes( 'at' ) ) {

					const match = stackLine.match( /\s+at\s+(.*?)\s+\((.*):(\d+):(\d+)\)/ );

					if ( match && match[ 1 ] && match[ 2 ] && match[ 3 ] && match[ 4 ] ) {

						// eg. JunctionConnectionFactory.createConnections
						const classAndMethod = match[ 1 ];
						const className = classAndMethod.split( '.' )[ 0 ] ?? 'unknown';

						// const line = match[ 3 ];
						// const column = match[ 4 ];

						// (Line:${ line }:${ column }) // can be added if needed
						return `${ className }`;

					}

				}

			}

		}

		return 'unknown';
	}

	private static writeLog ( level: string, message: string, optionalParams: any[] ): void {

		if ( Environment.production ) return;

		const callerInfo = this.getCallerInfo();

		// user friendly timestamp
		// const timestamp = new Date().toISOString();
		const timestamp = new Date().toLocaleString();

		let logMessage = `[${ timestamp }][${ level }]: ${ callerInfo } ${ message }` + ' ';

		switch ( level ) {
			case 'ERROR':
				console.error( logMessage, ...optionalParams );
				break;
			case 'WARN':
				console.warn( logMessage, ...optionalParams );
				break;
			default:
				console.log( logMessage, ...optionalParams );
				break;
		}

		if ( this.logging && this.isElectron ) {

			if ( Environment.production ) return;

			if ( this.logging ) {

				optionalParams.forEach( param => {

					let paramStr = '';

					if ( typeof param === 'object' ) {

						try {

							// paramStr = JSON.stringify( param, null, 2 );
							paramStr = param.toString();

						} catch ( error ) {

							paramStr = String( param );

							console.error( error );
							console.error( param );

						}

					} else {

						paramStr = String( param );

					}

					if ( paramStr.length > MAX_LENGTH ) {
						paramStr = paramStr.slice( 0, MAX_LENGTH ) + '... [truncated]';
					}

					logMessage += paramStr + '\n';

				} );

			}

			// Include stack trace for error and warn levels
			if ( level === 'ERROR' || level === 'WARN' ) {
				const error = new Error( message );
				logMessage += `Stack Trace:\n${ error.stack }`;
			}

			this.writeToFile( logMessage );
		}

	}

	private static writeToFile ( message: string ): void {

		const filePath = this.getFilePath();

		try {

			StorageService.instance.appendFileSync( filePath, message + '\n' );

		} catch ( error ) {

			console.error( 'Error writing log to file:', error );

		}

	}

	private static getFilePath (): string {

		return electronFs.currentDirectory + '/logs/' + this.generateFilename();

	}

	private static generateFilename (): string {

		return 'application.log';

		// generaete filename by date
		const date = new Date();
		const year = date.getFullYear();
		const month = ( '0' + ( date.getMonth() + 1 ) ).slice( -2 );
		const day = ( '0' + date.getDate() ).slice( -2 );

		return `${ year }-${ month }-${ day }_log.log`;

	}

	// private static safeJSONStringify ( obj: any, maxDepth: number ): string {
	// 	const seen = new WeakSet();
	// 	function depthLimitedReplacer ( depth: number ) {
	// 		return ( key, value ) => {
	// 			if ( depth > maxDepth ) return '[Max Depth Reached]';
	// 			if ( typeof value === "object" && value !== null ) {
	// 				if ( seen.has( value ) ) return '[Circular]';
	// 				seen.add( value );
	// 			}
	// 			return value;
	// 		};
	// 	}

	// 	try {
	// 		return JSON.stringify( obj, depthLimitedReplacer( 0 ), 2 );
	// 	} catch ( error ) {
	// 		return `[Stringification Error: ${ error.message }]`;
	// 	}
	// }

	// private static getCircularReplacer () {
	// 	const seen = new WeakSet();
	// 	return ( key, value ) => {
	// 		if ( typeof value === "object" && value !== null ) {
	// 			if ( seen.has( value ) ) {
	// 				return undefined; // Remove circular reference
	// 			}
	// 			seen.add( value );
	// 		}
	// 		return value;
	// 	};
	// }
}

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { StorageService } from 'app/io/storage.service';
import { Environment } from './environment';
import { TvElectronService } from 'app/services/tv-electron.service';
import { LogLevel } from './log-level';
import * as Logger from 'electron-log';

declare const electronFs;

const MAX_LENGTH = 1000;

export class Log {

	private static isElectron = TvElectronService.isElectronApp;
	private static logging: boolean = Environment.logging;
	private static logLevel: LogLevel = Environment.logLevel;

	private static cachedFilePath: string;

	static debug ( message: string, ...optionalParams: any[] ): void {

		this.writeLog( LogLevel.DEBUG, message, optionalParams );

	}

	static info ( ...message: any[] ): void {

		this.writeLog( LogLevel.INFO, message.join( ' ' ), [] );

	}

	static error ( message: string, ...optionalParams: any[] ): void {

		this.writeLog( LogLevel.ERROR, message, optionalParams );

	}

	static warn ( message: string, ...optionalParams: any[] ): void {

		this.writeLog( LogLevel.WARN, message, optionalParams );

	}

	private static writeLog ( level: LogLevel, message: string, optionalParams: any[] ): void {

		if ( level > this.logLevel ) return;

		const formattedMessage = this.formatLogMessage( level, message );

		this.writeToConsole( level, formattedMessage, optionalParams );

		if ( this.logging && this.isElectron ) {
			this.writeToFile( formattedMessage, level, message, optionalParams );
			// this.writeToLogger( level, formattedMessage, optionalParams );
		}

	}

	static writeToLogger ( level: LogLevel, formattedMessage: string, optionalParams: any[] ): void {

		switch ( level ) {
			case LogLevel.ERROR:
				Logger.error( formattedMessage, ...optionalParams );
				break;
			case LogLevel.WARN:
				Logger.warn( formattedMessage, ...optionalParams );
				break;
			case LogLevel.DEBUG:
				Logger.debug( formattedMessage, ...optionalParams );
				break;
			case LogLevel.INFO:
				Logger.info( formattedMessage, ...optionalParams );
				break;
			default:
				Logger.log( formattedMessage, ...optionalParams );
				break;
		}

	}

	private static formatLogMessage ( level: LogLevel, message: string ): string {

		const callerInfo = this.getCallerInfo();

		const timestamp = new Date().toLocaleString();

		return `[${ timestamp }][${ LogLevel[ level ] }]: ${ callerInfo } ${ message }`;

	}

	private static writeToConsole ( level: LogLevel, logMessage: string, optionalParams: any[] ): void {

		switch ( level ) {
			case LogLevel.ERROR:
				console.error( logMessage, ...optionalParams );
				break;
			case LogLevel.WARN:
				console.warn( logMessage, ...optionalParams );
				break;
			case LogLevel.DEBUG:
				console.debug( logMessage, ...optionalParams );
				break;
			case LogLevel.INFO:
				console.info( logMessage, ...optionalParams );
				break;
			default:
				console.log( logMessage, ...optionalParams );
				break;
		}

	}

	private static writeToFile ( logMessage: string, level: LogLevel, message: string, optionalParams: any[] ): void {

		let fileLogMessage = logMessage + '\n';

		optionalParams.forEach( param => {
			fileLogMessage += this.formatParam( param ) + '\n';
		} );

		if ( level === LogLevel.ERROR || level === LogLevel.WARN ) {
			const error = new Error( message );
			fileLogMessage += `Stack Trace:\n${ error.stack }`;
		}

		this.appendToFile( fileLogMessage );

	}

	private static formatParam ( param: any ): string {

		let paramStr = '';

		try {
			paramStr = typeof param === 'object' ? param.toString() : String( param );
		} catch {
			paramStr = String( param );
		}

		if ( paramStr.length > MAX_LENGTH ) {
			paramStr = paramStr.slice( 0, MAX_LENGTH ) + '... [truncated]';
		}

		return paramStr;

	}

	private static appendToFile ( message: string ): void {

		try {

			StorageService.instance.appendFileSync( this.getFilePath(), `${ message }\n` );

		} catch ( error ) {

			console.error( 'Error writing log to file:', error );

		}

	}

	private static getFilePath (): string {

		if ( this.cachedFilePath ) return this.cachedFilePath;

		const logFolder = electronFs.remote().app.getPath( 'logs' );

		this.cachedFilePath = `${ logFolder }/application.log`;

		return this.cachedFilePath;

	}

	private static getCallerInfo (): string {

		const stack = new Error().stack;

		if ( stack ) {

			const stackLines = stack.split( '\n' );

			for ( let i = 2; i < stackLines.length; i++ ) {

				const stackLine = stackLines[ i ];

				if ( !stackLine.includes( 'Log.' ) && stackLine.includes( 'at' ) ) {

					const match = stackLine.match( /\s+at\s+(.*?)\s+\((.*):(\d+):(\d+)\)/ );

					if ( match && match[ 1 ] && match[ 2 ] && match[ 3 ] && match[ 4 ] ) {

						return match[ 1 ].split( '.' )[ 0 ] ?? 'unknown';

					}

				}

			}

		}

		return 'unknown';

	}
}

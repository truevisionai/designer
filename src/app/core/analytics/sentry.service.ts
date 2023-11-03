/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { FileApiService } from '../../io/file-api.service';
import { Environment } from '../utils/environment';

@Injectable( {
	providedIn: 'root'
} )
export class SentryService {

	private static fileApiService: FileApiService;

	constructor ( fileApiService: FileApiService ) {

		SentryService.fileApiService = fileApiService;

	}

	static get isErrorTrackingEnabled (): boolean {

		return Environment.errorTrackingEnabled;

	}

	static setEmail ( email: string ): void {

		if ( !this.isErrorTrackingEnabled ) return;

		Sentry.setUser( {
			email: email,
			ip_address: '{{auto}}'
		} );

	}

	static init (): void {

		if ( !this.isErrorTrackingEnabled ) return;

		Sentry.init( {
			dsn: Environment.dsn,
			environment: Environment.environment,
			release: Environment.version,
		} );

	}

	static captureException ( error: Error, context?: any ): void {

		if ( !this.isErrorTrackingEnabled ) return;

		try {

			// we first try to get the map state and tv map state
			// and send it with sentry error
			// if it fails, we send the error without the map state
			this.captureWithMapState( error, context );

		} catch ( e ) {

			Sentry.captureException( 'Sending Via Scope Failed', context );
			Sentry.captureException( error, context );

		}

	}

	static captureWithMapState ( error: Error, context: any ) {

		if ( !this.isErrorTrackingEnabled ) return;

		this.fileApiService.uploadMapFiles( error ).subscribe( ( links ) => {

			Sentry.configureScope( scope => {
				scope.setExtra( 'links', links );
			} );

			Sentry.captureException( error, context );

		} );

	}

	static captureMessage ( message: string, context?: any ): void {

		if ( !this.isErrorTrackingEnabled ) return;

		Sentry.captureMessage( message, context );

	}

}

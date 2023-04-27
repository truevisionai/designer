/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import * as Sentry from "@sentry/angular";
import { Environment } from '../utils/environment';

@Injectable( {
	providedIn: 'root'
} )
export class SentryService {

	static get isErrorTrackingEnabled (): boolean {

		return Environment.errorTrackingEnabled;

	}

	static setEmail ( email: string ): void {

		if ( !this.isErrorTrackingEnabled ) return;

		Sentry.setUser( {
			email: email,
			ip_address: "{{auto}}"
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

		Sentry.captureException( error, context );

	}

	static captureMessage ( message: string, context?: any ): void {

		if ( !this.isErrorTrackingEnabled ) return;

		Sentry.captureMessage( message, context );

	}

}

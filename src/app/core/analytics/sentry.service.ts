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

	static setEmail ( email: string ): void {

		Sentry.setUser( {
			email: email,
			ip_address: "{{auto}}"
		} );

	}

	static init (): void {

		Sentry.init( {
			dsn: Environment.dsn,
			environment: Environment.environment,
			release: 'v' + Environment.version,
		} );

	}

	static captureException ( error: Error, context?: any ): void {

		Sentry.captureException( error, context );

	}

	static captureMessage ( message: string, context?: any ): void {

		Sentry.captureMessage( message, context );

	}

}

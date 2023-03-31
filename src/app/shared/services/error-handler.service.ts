/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ApplicationRef, ChangeDetectorRef, ErrorHandler, Injectable, Injector } from '@angular/core';
import { AnalyticsService } from 'app/core/analytics/analytics.service';
import { SentryService } from 'app/core/analytics/sentry.service';
import { Environment } from 'app/core/utils/environment';
import { SnackBar } from '../../services/snack-bar.service';

@Injectable()
export class ErrorHandlerService extends ErrorHandler {

	errorCount = 0;

	constructor ( protected injector: Injector, private analytics: AnalyticsService ) {
		super();
	}

	// https://github.com/angular/angular/issues/17010
	handleError ( error: Error ) {

		if ( !Environment.production ) SnackBar.error( error.message );
		if ( !Environment.production ) console.error( error );

		if ( Environment.production && this.analytics ) this.analytics.trackError( error );
		if ( Environment.production ) SnackBar.error( `${ error.name } :  Oops Something Went Wrong` );

		SentryService.captureException( error );

		let increment = 5;
		let max = 50;

		// Prevents change detection
		let debugCtx = error[ 'ngDebugContext' ];
		let changeDetectorRef = debugCtx && debugCtx.injector.get( ChangeDetectorRef );
		if ( changeDetectorRef ) changeDetectorRef.detach();

		this.errorCount = this.errorCount + 1;
		if ( this.errorCount % increment === 0 ) {
			super.handleError( error );

			if ( this.errorCount === max ) {

				let appRef = this.injector.get( ApplicationRef );
				appRef.tick();
			}
		} else if ( this.errorCount === 1 ) {
			super.handleError( error );
		}
	}
}

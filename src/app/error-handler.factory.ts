/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ErrorHandler, Injector } from '@angular/core';
import { AnalyticsService } from './core/analytics/analytics.service';
import { Environment } from './core/utils/environment';
import { CustomErrorHandler } from './views/shared/services/error-handler.service';
import { SentryService } from './core/analytics/sentry.service';
import { SnackBar } from './services/snack-bar.service';

export function errorHandlerFactory ( injector: Injector, analytics: AnalyticsService, sentry: SentryService, snackBar: SnackBar ): ErrorHandler {

	if ( Environment.production && Environment.errorTrackingEnabled ) {

		return new CustomErrorHandler( injector, sentry, snackBar );

	} else {

		return new ErrorHandler();

	}
}

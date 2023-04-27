import { ErrorHandler, Injector } from '@angular/core';
import { AnalyticsService } from './core/analytics/analytics.service';
import { Environment } from './core/utils/environment';
import { CustomErrorHandler } from './shared/services/error-handler.service';

export function errorHandlerFactory ( injector: Injector, analytics: AnalyticsService ): ErrorHandler {

	if ( Environment.production && Environment.errorTrackingEnabled ) {

		return new CustomErrorHandler( injector, analytics );

	} else {

		return new ErrorHandler();

	}
}

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ApplicationRef, ChangeDetectorRef, ErrorHandler, Injectable, Injector } from '@angular/core';
import { SnackBar } from '../../services/snack-bar.service';
import { environment } from '../../../environments/environment';
import { AnalyticsService } from 'app/core/analytics/analytics.service';

@Injectable()
export class ErrorHandlerService extends ErrorHandler {

    errorCount = 0;

    constructor ( protected injector: Injector, private analytics: AnalyticsService ) {
        super();
    }

    // https://github.com/angular/angular/issues/17010
    handleError ( error: Error ) {

        if ( !environment.production ) SnackBar.error( error.message );
        if ( !environment.production ) console.error( error );

        if ( environment.production && this.analytics ) this.analytics.trackError( error );
        if ( environment.production ) SnackBar.error( `${ error.name } :  Oops Something Went Wrong` );

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

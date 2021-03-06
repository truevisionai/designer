/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { MatSnackBarVerticalPosition } from '@angular/material/snack-bar/typings/snack-bar-config';
import { AnalyticsService } from 'app/core/analytics/analytics.service';

@Injectable( {
    providedIn: 'root'
} )
export class SnackBar {

    private static snackBar: MatSnackBar;
    private static verticalPosition: MatSnackBarVerticalPosition = 'bottom';
    private static analytics: AnalyticsService;

    constructor ( private snackBar: MatSnackBar, private analytics: AnalyticsService ) {

        SnackBar.snackBar = snackBar;
        SnackBar.analytics = analytics;

    }

    /**
     * @deprecated use show instead
     */
    static open ( message: string = '', action: string = '', duration: number = 2000 ): MatSnackBarRef<SimpleSnackBar> {

        return this.show( message, action, duration );

    }

    static show ( message: string = '', action: string = '', duration: number = 2000 ): MatSnackBarRef<SimpleSnackBar> {

        return this.snackBar.open( message, action, {
            duration: duration,
            verticalPosition: this.verticalPosition,
            horizontalPosition: 'right'
        } );

    }

    static success ( message: string = '', action: string = '', duration: number = 2000 ): MatSnackBarRef<SimpleSnackBar> {

        return this.snackBar.open( message, action, {
            duration: duration,
            verticalPosition: this.verticalPosition,
            horizontalPosition: 'right',
            panelClass: [ 'green-snackbar' ]
        } );

    }

    static error ( message: string = '', action: string = '', duration: number = 2000 ): MatSnackBarRef<SimpleSnackBar> {

        if ( this.analytics ) this.analytics.trackError( { name: message, message: message, stack: message } );

        return this.snackBar.open( message, action, {
            duration: duration,
            verticalPosition: this.verticalPosition,
            horizontalPosition: 'right',
            panelClass: [ 'red-snackbar' ]
        } );

    }

    open ( message: string = '', action: string = '', duration: number = 2000 ): MatSnackBarRef<SimpleSnackBar> {

        return this.snackBar.open( message, action, {
            duration: duration,
            verticalPosition: SnackBar.verticalPosition,
            horizontalPosition: 'right'
        } );

    }

}

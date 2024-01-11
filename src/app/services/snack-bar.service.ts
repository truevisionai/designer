/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, MatSnackBarVerticalPosition, SimpleSnackBar } from '@angular/material/snack-bar';
// import { SentryService } from 'app/core/analytics/sentry.service';
import { TvConsole } from 'app/core/utils/console';

@Injectable( {
	providedIn: 'root'
} )
export class SnackBar {

	private static snackBar: MatSnackBar;
	private static verticalPosition: MatSnackBarVerticalPosition = 'bottom';

	constructor ( private snackBar: MatSnackBar ) {

		SnackBar.snackBar = snackBar;

	}


	static show ( message: string = '', action: string = '', duration: number = 2000 ): MatSnackBarRef<SimpleSnackBar> {

		TvConsole.info( message );

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

	static warn ( message: string = '', action: string = '', duration: number = 5000 ): MatSnackBarRef<SimpleSnackBar> {

		TvConsole.warn( message );

		return this.snackBar.open( message, action, {
			duration: duration,
			verticalPosition: this.verticalPosition,
			horizontalPosition: 'right',
			panelClass: [ 'yellow-snackbar' ]
		} );

	}

	static error ( message: string = '', action: string = '', duration: number = 2000 ): MatSnackBarRef<SimpleSnackBar> {

		TvConsole.error( message );

		// SentryService.captureMessage( 'SnackBar: ' + message, 'error' );

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

	success ( message: string = '', action: string = '', duration: number = 2000 ): MatSnackBarRef<SimpleSnackBar> {

		return this.snackBar.open( message, action, {
			duration: duration,
			verticalPosition: SnackBar.verticalPosition,
			horizontalPosition: 'right',
			panelClass: [ 'green-snackbar' ]
		} );

	}

	warn ( message: string = '', action: string = '', duration: number = 5000 ): MatSnackBarRef<SimpleSnackBar> {

		return this.snackBar.open( message, action, {
			duration: duration,
			verticalPosition: SnackBar.verticalPosition,
			horizontalPosition: 'right',
			panelClass: [ 'yellow-snackbar' ]
		} );

	}

}

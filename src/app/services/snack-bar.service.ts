/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, MatSnackBarVerticalPosition, SimpleSnackBar } from '@angular/material/snack-bar';
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

	open ( message: string = '', action: string = '', duration: number = 2000 ): MatSnackBarRef<SimpleSnackBar> {

		return this.snackBar.open( message, action, {
			duration: duration,
			verticalPosition: SnackBar.verticalPosition,
			horizontalPosition: 'right'
		} );

	}

	show ( message: string = '', action: string = '', duration: number = 2000 ): MatSnackBarRef<SimpleSnackBar> {

		return this.open( message, action, duration );

	}

	error ( message: string = '', action: string = '', duration: number = 2000 ): MatSnackBarRef<SimpleSnackBar> {

		return this.snackBar.open( message, action, {
			duration: duration,
			verticalPosition: SnackBar.verticalPosition,
			horizontalPosition: 'right',
			panelClass: [ 'red-snackbar' ]
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

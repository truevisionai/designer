/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';

@Injectable( {
	providedIn: 'root'
} )
export class SnackBar {

	constructor ( private snackBar: MatSnackBar ) { }

	open ( message: string = '', action: string = '', duration: number = 2000 ): MatSnackBarRef<SimpleSnackBar> {

		return this.snackBar.open( message, action, {
			duration: duration,
			verticalPosition: 'bottom',
			horizontalPosition: 'right'
		} );

	}

	show ( message: string = '', action: string = '', duration: number = 2000 ): MatSnackBarRef<SimpleSnackBar> {

		return this.open( message, action, duration );

	}

	error ( message: string = '', action: string = '', duration: number = 2000 ): MatSnackBarRef<SimpleSnackBar> {

		return this.snackBar.open( message, action, {
			duration: duration,
			verticalPosition: 'bottom',
			horizontalPosition: 'right',
			panelClass: [ 'red-snackbar' ]
		} );

	}

	success ( message: string = '', action: string = '', duration: number = 2000 ): MatSnackBarRef<SimpleSnackBar> {

		return this.snackBar.open( message, action, {
			duration: duration,
			verticalPosition: 'bottom',
			horizontalPosition: 'right',
			panelClass: [ 'green-snackbar' ]
		} );

	}

	warn ( message: string = '', action: string = '', duration: number = 5000 ): MatSnackBarRef<SimpleSnackBar> {

		return this.snackBar.open( message, action, {
			duration: duration,
			verticalPosition: 'bottom',
			horizontalPosition: 'right',
			panelClass: [ 'yellow-snackbar' ]
		} );

	}

}

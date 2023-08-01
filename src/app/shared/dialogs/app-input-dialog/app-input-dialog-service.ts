/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { Observable } from 'rxjs';
import { AppInputDialogComponent } from './app-input-dialog.component';

export class AppInputDialogField {
	name: string;
	key: string;
	type: string;
	value: any;
}

@Injectable()
export class AppInputDialogService {

	dialogRef: MatDialogRef<AppInputDialogComponent>;

	constructor ( private dialog: MatDialog ) { }

	public open ( title: string = 'Please wait', fields: AppInputDialogField[] ): Observable<any> {

		this.dialogRef = this.dialog.open( AppInputDialogComponent, {
			width: '50vw',
		} );

		this.dialogRef.componentInstance.title = title;

		this.dialogRef.componentInstance.fields = fields;

		return this.dialogRef.afterClosed();

	}

	public close () {
		if ( this.dialogRef ) {
			this.dialogRef.close();
		}
	}
}

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AppInputDialogField } from './app-input-dialog-service';

@Component( {
	selector: 'app-app-input-dialog',
	templateUrl: './app-input-dialog.component.html',
	styleUrls: [ './app-input-dialog.component.scss' ]
} )
export class AppInputDialogComponent implements OnInit {

	title: string;

	fields: AppInputDialogField[] = [];

	form: FormGroup;

	constructor (
		private fb: FormBuilder,
		private dialogRef: MatDialogRef<AppInputDialogComponent>
	) {
	}

	ngOnInit (): void {

		this.form = this.fb.group( {} );

		this.fields.forEach( ( field, index ) => {

			this.form.addControl( field.key, new FormControl( field.value || '' ) );

		} );

	}

	onFieldChange ( field: AppInputDialogField, value: any ): void {

		field.value = value;

		this.form.get( field.key ).setValue( value );

	}

	save (): void {

		this.dialogRef.close( this.form.value );

	}

}

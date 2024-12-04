/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";

/**
 * @title Dialog Overview
 */
@Component( {
	selector: 'app-questions-dialog',
	template: `<app-questions (submitted)="onSubmit()" [showHeader]='false'></app-questions>`,
	styles: [
		`.centered-container { align-items: baseline !important; }`,
	],
} )
export class QuesionsDialogComponent {

	constructor (
		public dialogRef: MatDialogRef<QuesionsDialogComponent>,
		@Inject( MAT_DIALOG_DATA ) public data: any,
	) { }

	onSubmit (): void {
		this.dialogRef.close();
	}

}

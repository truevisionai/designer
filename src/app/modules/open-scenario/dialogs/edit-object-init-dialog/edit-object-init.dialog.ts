/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EntityObject } from '../../models/osc-entities';

export class EditObjectInitDialogData {
	constructor ( public object: EntityObject ) {

	}
}

@Component( {
	selector: 'app-edit-object-init-dialog',
	templateUrl: './edit-object-init.dialog.html'
} )
export class EditObjectInitDialog implements OnInit {

	constructor (
		public dialogRef: MatDialogRef<EditObjectInitDialog>,
		@Inject( MAT_DIALOG_DATA ) public data: EditObjectInitDialogData,
		public dialog: MatDialog
	) {

	}

	get entity () {
		return this.data.object;
	}

	ngOnInit () {


	}


}

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OscEntityObject } from '../../models/osc-entities';

export class EditObjectInitDialogData {
    constructor ( public object: OscEntityObject ) {

    }
}

@Component( {
    selector: 'app-edit-object-init-dialog',
    templateUrl: './edit-object-init.dialog.html'
} )
export class EditObjectInitDialog implements OnInit {

    get entity () {
        return this.data.object;
    }

    constructor (
        public dialogRef: MatDialogRef<EditObjectInitDialog>,
        @Inject( MAT_DIALOG_DATA ) public data: EditObjectInitDialogData,
        public dialog: MatDialog
    ) {

    }

    ngOnInit () {


    }


}

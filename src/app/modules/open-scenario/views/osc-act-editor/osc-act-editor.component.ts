import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OscAct } from '../../models/osc-act';
import { OscEntityObject } from '../../models/osc-entities';
import { OscSourceFile } from '../../services/osc-source-file';
import { ChooseConditionDialogComponent } from '../../dialogs/choose-condition-dialog/choose-condition-dialog.component';
import { AbstractCondition } from '../../models/conditions/osc-condition';

@Component( {
	selector: 'app-osc-act-editor',
	templateUrl: './osc-act-editor.component.html',
	styleUrls: [ './osc-act-editor.component.css' ]
} )
export class OscActEditorComponent implements OnInit {

	acts: OscAct[] = [];
	selectedAct: OscAct;

	constructor (
		public dialogRef: MatDialogRef<OscActEditorComponent>,
		@Inject( MAT_DIALOG_DATA ) public data: OscEntityObject,
		private dialog: MatDialog
	) {

	}

	get entity () {
		return this.data;
	}

	get scenario () {
		return OscSourceFile.openScenario;
	}

	ngOnInit () {

		this.acts = this.scenario.getActsByOwner( this.entity.name );
		this.selectedAct = this.acts[ 0 ];

	}

	addCondition () {

		const dialogRef = this.dialog.open( ChooseConditionDialogComponent, {
			width: '260px',
			height: '400px',
			data: null
		} );

		dialogRef.afterClosed().subscribe( ( res: AbstractCondition ) => {

			if ( res != null ) this.selectedAct.addStartCondition( res );

		} );
	}

}

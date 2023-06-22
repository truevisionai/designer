/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Condition } from '../../models/conditions/tv-condition';
import { Act } from '../../models/tv-act';
import { EntityObject } from '../../models/tv-entities';
import { ScenarioInstance } from '../../services/scenario-instance';

@Component( {
	selector: 'app-tv-act-editor',
	templateUrl: './tv-act-editor.component.html',
	styleUrls: [ './tv-act-editor.component.css' ]
} )
export class ActEditorComponent implements OnInit {

	acts: Act[] = [];
	selectedAct: Act;

	constructor (
		public dialogRef: MatDialogRef<ActEditorComponent>,
		@Inject( MAT_DIALOG_DATA ) public data: EntityObject,
		private dialog: MatDialog
	) {

	}

	get entity () {
		return this.data;
	}

	get scenario () {
		return ScenarioInstance.scenario;
	}

	ngOnInit () {

		this.acts = this.scenario.getActsByOwner( this.entity.name );
		this.selectedAct = this.acts[ 0 ];

	}

	addCondition () {

		throw new Error( 'Not implemented' );

	}

}

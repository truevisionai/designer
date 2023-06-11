/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Debug } from 'app/core/utils/debug';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { AbstractCondition } from '../../models/conditions/osc-condition';
import { OscEntityObject } from '../../models/osc-entities';
import { OscConditionType } from '../../models/osc-enums';
import { OscEvent } from '../../models/osc-event';
import { AbstractAction } from '../../models/osc-interfaces';
import { OscManeuver } from '../../models/osc-maneuver';
import { OscSourceFile } from '../../services/osc-source-file';
import { OscEditorComponent } from '../../views/osc-editor/osc-editor.component';
import { ChooseActionDialogComponent, ChooseActionDialogData } from '../choose-action-dialog/choose-action-dialog.component';

export class EditActionsDialogData {
	constructor ( public object: OscEntityObject ) {

	}
}

@Component( {
	selector: 'app-edit-actions-dialog',
	templateUrl: './edit-actions-dialog.component.html'
} )
export class EditActionsDialogComponent implements OnInit {

	selectedManeuver: OscManeuver;
	selectedEvent: OscEvent;
	selectedAction: AbstractAction;

	conditionTypes: OscConditionType;

	maneuvers: OscManeuver[];

	constructor (
		public dialogRef: MatDialogRef<EditActionsDialogComponent>,
		@Inject( MAT_DIALOG_DATA ) public data: EditActionsDialogData,
		public dialog: MatDialog
	) {

	}

	get entity () {
		return this.data.object;
	}

	get maneuver () {
		return this.maneuvers[ 0 ];
	}

	get event () {
		return this.maneuver.events[ 0 ];
	}

	get condition () {
		return this.event.startConditionGroups[ 0 ].conditions[ 0 ];
	}

	get eventActions () {
		if ( this.selectedEvent ) return this.selectedEvent.getActions();
	}

	get eventConditions () {
		if ( this.selectedEvent ) return this.selectedEvent.startConditions;
	}

	selectManeuver ( maneuver: OscManeuver ) {

		this.selectedManeuver = maneuver;

	}

	selectEvent ( event: OscEvent ) {

		this.selectedEvent = event;

	}

	selectAction ( action: AbstractAction ) {

	}

	ngOnInit () {

		var stories = OscSourceFile.openScenario.getStoriesByOwner( this.entity.name );

		var sequences = OscSourceFile.openScenario.getSequencesByActor( this.entity.name );

		this.maneuvers = OscSourceFile.openScenario.getManeuversForEntity( this.entity.name );

		Debug.log( stories );

		Debug.log( sequences );

		Debug.log( this.maneuvers );

	}

	onConditionChanged ( condition: AbstractCondition ) {

		const array = this.selectedEvent.startConditions;

		const index = 0;

		const cmd = ( new SetValueCommand( array, index, condition ) );

		OscEditorComponent.execute( cmd );

	}

	onActionSelected ( action: AbstractAction ) {

		this.selectedAction = action;

	}

	addAction () {

		const data = new ChooseActionDialogData();

		const dialogRef = this.dialog.open( ChooseActionDialogComponent, {
			width: '360px',
			data: data
		} );

		dialogRef.afterClosed().subscribe( ( response: ChooseActionDialogData ) => {

			Debug.log( 'dialog-closed', response );

			if ( response.action != null ) {

				this.selectedEvent.addNewAction( response.actionName, response.action );

			}

		} );

	}

}

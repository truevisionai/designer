/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Debug } from 'app/core/utils/debug';
import { SetValueCommand } from '../../../three-js/commands/set-value-command';
import { FollowTrajectoryAction } from '../../models/actions/osc-follow-trajectory-action';
import { AbstractCondition } from '../../models/conditions/osc-condition';
import { EntityObject } from '../../models/osc-entities';
import { ConditionType } from '../../models/osc-enums';
import { TvEvent } from '../../models/osc-event';
import { AbstractAction } from '../../models/osc-interfaces';
import { Maneuver } from '../../models/osc-maneuver';
import { EnumTrajectoryDomain, PolylineShape, Trajectory, Vertex } from '../../models/osc-trajectory';
import { WorldPosition } from '../../models/positions/osc-world-position';
import { TvScenarioInstance } from '../../services/tv-scenario-instance';
import { EditorComponent } from '../../views/osc-editor/osc-editor.component';
import { ChooseActionDialogComponent, ChooseActionDialogData } from '../choose-action-dialog/choose-action-dialog.component';
import { EditActionsDialogComponent, EditActionsDialogData } from '../edit-actions-dialog/edit-actions-dialog.component';

export class EditStoryDialogData {
	constructor ( public object: EntityObject ) {

	}
}


@Component( {
	selector: 'app-edit-story-dialog',
	templateUrl: './edit-story-dialog.component.html'
} )
export class EditStoryDialog implements OnInit {

	selectedManeuver: Maneuver;
	selectedEvent: TvEvent;
	selectedAction: AbstractAction;

	conditionTypes: ConditionType;

	maneuvers: Maneuver[];

	constructor (
		public dialogRef: MatDialogRef<EditActionsDialogComponent>,
		@Inject( MAT_DIALOG_DATA ) public data: EditActionsDialogData,
		public dialog: MatDialog
	) {

	}

	get openScenario () {
		return TvScenarioInstance.openScenario;
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

	ngOnInit () {

		var stories = this.openScenario.getStoriesByOwner( this.entity.name );

		var sequences = this.openScenario.getSequencesByActor( this.entity.name );

		this.maneuvers = this.openScenario.getManeuversForEntity( this.entity.name );

		Debug.log( stories );

		Debug.log( sequences );

		Debug.log( this.maneuvers );

	}

	selectManeuver ( maneuver: Maneuver ) {

		this.selectedManeuver = maneuver;

	}

	selectEvent ( event: TvEvent ) {

		this.selectedEvent = event;

	}

	selectAction ( action: AbstractAction ) {

	}

	onConditionChanged ( condition: AbstractCondition ) {

		const array = this.selectedEvent.startConditions;

		const index = 0;

		const cmd = ( new SetValueCommand( array, index, condition ) );

		EditorComponent.execute( cmd );

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

			if ( response != null && response.action != null ) {

				this.selectedEvent.addNewAction( response.actionName, response.action );

			}

		} );

	}

	addManeuver () {

		// TODO : Check before adding

		const story = this.openScenario.storyboard.addNewStory( 'NewStory', this.entity.name );

		const act = story.addNewAct( 'NewAct' );

		const sequence = act.addNewSequence( 'NewSequence', 1, this.entity.name );

		const maneuver = sequence.addNewManeuver( 'NewManeuever' );

		const event = maneuver.addNewEvent( 'NewEvent', '100' );

		const trajectory = new Trajectory( 'NewTrajectory', false, EnumTrajectoryDomain.Distance );

		trajectory.vertices.push( new Vertex( 0, new WorldPosition( 0, 0, 0 ), new PolylineShape ) );
		trajectory.vertices.push( new Vertex( 1, new WorldPosition( 1, 1, 0 ), new PolylineShape ) );

		const action = event.addNewAction( 'NewAction', new FollowTrajectoryAction( trajectory ) );

		Debug.log( this.openScenario.storyboard );

		// let maneuver = new Maneuver( 'NewManeuver' );

		// this.openScenario.addManeuver( this.entity.name, maneuver );

	}

}

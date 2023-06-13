/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { AppInspector } from '../../../../core/inspector';
import { ChooseActionDialogData } from '../../dialogs/choose-action-dialog/choose-action-dialog.component';
import { AbsoluteTarget } from '../../models/actions/osc-absolute-target';
import { FollowTrajectoryAction } from '../../models/actions/osc-follow-trajectory-action';
import { SpeedDynamics } from '../../models/actions/osc-private-action';
import { SpeedAction } from '../../models/actions/osc-speed-action';
import { Act } from '../../models/osc-act';
import { EntityObject } from '../../models/osc-entities';
import { ActionType, DynamicsShape } from '../../models/osc-enums';
import { TvEvent } from '../../models/osc-event';
import { AbstractPrivateAction } from '../../models/osc-interfaces';
import { Maneuver } from '../../models/osc-maneuver';
import { Sequence } from '../../models/osc-sequence';
import { Story } from '../../models/osc-story';
import { EnumTrajectoryDomain, Trajectory } from '../../models/osc-trajectory';
import { DialogService } from '../../services/osc-dialog.service';
import { TvScenarioInstance } from '../../services/tv-scenario-instance';
import {
	FollowTrajectoryActionComponent
} from '../../views/osc-story-editor/actions/private-actions/follow-trajectory-action/follow-trajectory-action.component';
import { EventEditorComponent } from '../../views/osc-story-editor/event-editor/event-editor.component';

@Component( {
	selector: 'app-osc-player-actions-inspector',
	templateUrl: './osc-player-actions-inspector.component.html',
	styleUrls: [ './osc-player-actions-inspector.component.css' ]
} )
export class ActionsInspectorComponent implements OnInit, IComponent {

	data: EntityObject;

	constructor ( private dialogService: DialogService ) {
	}

	get entity () {
		return this.data;
	}

	get scenario () {
		return TvScenarioInstance.openScenario;
	}

	get actions () {
		return this.scenario.getActionsByEntity( this.entity.name ) as AbstractPrivateAction[];
	}

	get maneuvers () {
		return this.scenario.getManeuversForEntity( this.entity.name );
	}

	ngOnInit () {

	}

	addAction () {

		this.dialogService.openChooseActionDialog( ( data: ChooseActionDialogData ) => {

			const maneuver = this.getManeuver();

			const eventName = TvEvent.getNewName();

			const event = maneuver.addNewEvent( eventName, 'overwrite' );

			event.addNewAction( data.actionName, data.action );

		} );

	}

	editAction ( action: AbstractPrivateAction ) {

		// TODO: Add support for other trajection action types
		if ( action.actionType === ActionType.Private_Routing ) {

			this.editFollowTrajectoryAction( action as FollowTrajectoryAction );

		} else if ( action.actionType === ActionType.Private_Longitudinal_Speed ) {

			const maneuver = this.getManeuver();

			if ( maneuver.events.length === 0 ) throw new Error( 'no event exists' );

			const event = maneuver.events[ 0 ];

			AppInspector.setInspector( EventEditorComponent, event );

		} else {

			throw new Error( 'Unsupported action' );

		}

	}

	editEvent ( event: TvEvent ) {

		AppInspector.setInspector( EventEditorComponent, event );

	}

	editFollowTrajectoryAction ( action: FollowTrajectoryAction ) {

		AppInspector.setInspector( FollowTrajectoryActionComponent, action );

	}

	addTrajectoryAction () {

		const maneuver = this.getManeuver();

		const event = maneuver.addNewEvent( 'FollowTrajectoryEvent', 'overwrite' );

		const trajectory = new Trajectory( 'Trajectory1', false, EnumTrajectoryDomain.Time );

		const action = new FollowTrajectoryAction( trajectory );

		event.addNewAction( 'TrajectoryAction', action );

		this.editFollowTrajectoryAction( action );

	}

	addChangeLaneAction () {

		const maneuvers = this.getManeuver();

	}

	addSpeedAction () {

		const maneuver = this.getManeuver();

		const eventName = TvEvent.getNewName( 'ChangeSpeed' );

		const event = maneuver.addNewEvent( eventName, 'overwrite' );

		const dynamics = new SpeedDynamics( DynamicsShape.step );

		const target = new AbsoluteTarget( 10 );

		const action = new SpeedAction( dynamics, target );

		event.addNewAction( 'SpeedChangeAction', action );

		// AppInspector.setInspector( SpeedActionComponent, action );

		AppInspector.setInspector( EventEditorComponent, event );

	}

	private getManeuver () {

		if ( this.maneuvers.length > 0 ) {

			return this.maneuvers[ 0 ];

		} else {

			return this.createManuever();

		}

	}

	private getEvent (): TvEvent {

		const maneuver = this.getManeuver();

		const eventName = TvEvent.getNewName();

		return maneuver.addNewEvent( eventName, 'overwrite' );

	}

	private createManuever () {

		const storyName = Story.getNewName();

		const story = this.scenario.storyboard.addNewStory( storyName, this.entity.name );

		const act = story.addNewAct( Act.getNewName() );

		const sequence = act.addNewSequence( Sequence.getNewName(), 1, this.entity.name );

		return sequence.addNewManeuver( Maneuver.getNewName() );

	}

}

import { Component, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { AppInspector } from '../../../../core/inspector';
import { ChooseActionDialogData } from '../../dialogs/choose-action-dialog/choose-action-dialog.component';
import { OscAbsoluteTarget } from '../../models/actions/osc-absolute-target';
import { OscFollowTrajectoryAction } from '../../models/actions/osc-follow-trajectory-action';
import { OscSpeedDynamics } from '../../models/actions/osc-private-action';
import { OscSpeedAction } from '../../models/actions/osc-speed-action';
import { OscAct } from '../../models/osc-act';
import { OscEntityObject } from '../../models/osc-entities';
import { OscActionType, OscDynamicsShape } from '../../models/osc-enums';
import { OscEvent } from '../../models/osc-event';
import { AbstractPrivateAction } from '../../models/osc-interfaces';
import { OscManeuver } from '../../models/osc-maneuver';
import { OscSequence } from '../../models/osc-sequence';
import { OscStory } from '../../models/osc-story';
import { EnumTrajectoryDomain, OscTrajectory } from '../../models/osc-trajectory';
import { OscDialogService } from '../../services/osc-dialog.service';
import { OscSourceFile } from '../../services/osc-source-file';
import {
	FollowTrajectoryActionComponent
} from '../../views/osc-story-editor/actions/private-actions/follow-trajectory-action/follow-trajectory-action.component';
import { EventEditorComponent } from '../../views/osc-story-editor/event-editor/event-editor.component';

@Component( {
	selector: 'app-osc-player-actions-inspector',
	templateUrl: './osc-player-actions-inspector.component.html',
	styleUrls: [ './osc-player-actions-inspector.component.css' ]
} )
export class OscActionsInspectorComponent implements OnInit, IComponent {

	data: OscEntityObject;

	constructor ( private dialogService: OscDialogService ) {
	}

	get entity () {
		return this.data;
	}

	get scenario () {
		return OscSourceFile.openScenario;
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

			const eventName = OscEvent.getNewName();

			const event = maneuver.addNewEvent( eventName, 'overwrite' );

			event.addNewAction( data.actionName, data.action );

		} );

	}

	editAction ( action: AbstractPrivateAction ) {

		// TODO: Add support for other trajection action types
		if ( action.actionType === OscActionType.Private_Routing ) {

			this.editFollowTrajectoryAction( action as OscFollowTrajectoryAction );

		} else if ( action.actionType === OscActionType.Private_Longitudinal_Speed ) {

			const maneuver = this.getManeuver();

			if ( maneuver.events.length === 0 ) throw new Error( 'no event exists' );

			const event = maneuver.events[ 0 ];

			AppInspector.setInspector( EventEditorComponent, event );

		} else {

			throw new Error( 'Unsupported action' );

		}

	}

	editEvent ( event: OscEvent ) {

		AppInspector.setInspector( EventEditorComponent, event );

	}

	editFollowTrajectoryAction ( action: OscFollowTrajectoryAction ) {

		AppInspector.setInspector( FollowTrajectoryActionComponent, action );

	}

	addTrajectoryAction () {

		const maneuver = this.getManeuver();

		const event = maneuver.addNewEvent( 'FollowTrajectoryEvent', 'overwrite' );

		const trajectory = new OscTrajectory( 'Trajectory1', false, EnumTrajectoryDomain.Time );

		const action = new OscFollowTrajectoryAction( trajectory );

		event.addNewAction( 'TrajectoryAction', action );

		this.editFollowTrajectoryAction( action );

	}

	addChangeLaneAction () {

		const maneuvers = this.getManeuver();

	}

	addSpeedAction () {

		const maneuver = this.getManeuver();

		const eventName = OscEvent.getNewName( 'ChangeSpeed' );

		const event = maneuver.addNewEvent( eventName, 'overwrite' );

		const dynamics = new OscSpeedDynamics( OscDynamicsShape.step );

		const target = new OscAbsoluteTarget( 10 );

		const action = new OscSpeedAction( dynamics, target );

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

	private getEvent (): OscEvent {

		const maneuver = this.getManeuver();

		const eventName = OscEvent.getNewName();

		return maneuver.addNewEvent( eventName, 'overwrite' );

	}

	private createManuever () {

		const storyName = OscStory.getNewName();

		const story = this.scenario.storyboard.addNewStory( storyName, this.entity.name );

		const act = story.addNewAct( OscAct.getNewName() );

		const sequence = act.addNewSequence( OscSequence.getNewName(), 1, this.entity.name );

		return sequence.addNewManeuver( OscManeuver.getNewName() );

	}

}

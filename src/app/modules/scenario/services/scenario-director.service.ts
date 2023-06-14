/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { PlayerService, PlayerUpdateData } from '../../../core/player.service';
import { TvPosTheta } from '../../tv-map/models/tv-pos-theta';
import { TvMapQueries } from '../../tv-map/queries/tv-map-queries';
import { TvMapInstance } from '../../tv-map/services/tv-map-source-file';
import { ActionService } from '../builders/action-service';
import { ResetHelper } from '../helpers/tv-reset-helper';
import { ConditionService } from '../builders/condition-service';
import { AbstractAction } from '../models/abstract-action';
import { Act } from '../models/tv-act';
import { EntityObject } from '../models/tv-entities';
import { StoryElementType } from '../models/tv-enums';
import { TvEvent } from '../models/tv-event';
import { Maneuver } from '../models/tv-maneuver';
import { Sequence } from '../models/tv-sequence';
import { Story } from '../models/tv-story';
import { TvScenarioInstance } from './tv-scenario-instance';

export interface StoryEvent {
	name: string;
	type: StoryElementType;
}

@Injectable( {
	providedIn: 'root'
} )
export class ScenarioDirectorService {

	static traffic: Map<number, EntityObject[]> = new Map<number, EntityObject[]>();

	private added: boolean;
	private eventIndex: number = 0;
	private logEvents: boolean = true;

	constructor ( public userPlayer: PlayerService ) {

		userPlayer.playerStarted.subscribe( e => this.onPlayerStarted() );
		userPlayer.playerResumed.subscribe( e => this.onPlayerResumed() );
		userPlayer.playerStopped.subscribe( e => this.onPlayerStopped() );
		userPlayer.playerPaused.subscribe( e => this.onPlayerPaused() );
		userPlayer.playerTick.subscribe( e => this.onPlayerTick( e ) );

	}

	get openDrive () {

		return TvMapInstance.map;

	}

	get openScenario () {

		return TvScenarioInstance.openScenario;

	}

	private onPlayerStarted () {

		if ( this.logEvents ) console.info( 'scenario-started', this.openScenario );

		this.performInitActions();

	}

	private onPlayerResumed () {

		if ( this.logEvents ) console.info( 'scenario-resumed' );

	}

	private onPlayerPaused () {

		if ( this.logEvents ) console.info( 'scenario-paused' );

	}

	private onPlayerStopped () {

		if ( this.logEvents ) console.info( 'scenario-stopped' );

		this.performInitActions();

		this.resetOpenScenario();
	}

	private onPlayerTick ( e: PlayerUpdateData ) {

		if ( ConditionService.hasGroupsPassed( this.openScenario.storyboard.endConditionGroups ) ) {

			this.userPlayer.stop();

		} else {

			this.openScenario.storyboard.stories.forEach( story => {

				this.runStory( story );

			} );

			this.openScenario.objects.forEach( obj => {

				obj.update();

			} );

		}

	}

	private performInitActions () {

		// // set parameters
		// this.reader.replaceParamaterValues( this.openScenario.objects, ( object, property ) => {
		//     console.log( 'replaced', object, property );
		// } );

		// set road traffic state
		// this.openDrive.roads.forEach( road => PlayerService.traffic.set( road.id, [] ) );

		this.openScenario.objects.forEach( obj => {

			obj.initActions.forEach( action => {

				ActionService.executePrivateAction( obj, action );

			} );

			this.setRoadProperties( obj );

		} );

		// if ( this.added ) return;
		//
		// const story = this.openScenario.storyboard.addNewStory( 'NewStory' );
		//
		// const act = story.addNewAct( 'NewAct' );
		//
		// const group = act.addStartCondition( new SimulationTimeCondition( 2, Rule.equal_to ) );
		//
		// this.added = true;
	}

	private runStory ( story: Story ) {

		if ( this.logEvents ) console.info( 'running-story', story.name );

		story.acts.forEach( act => {

			if ( !act.hasStarted ) {

				act.shouldStart = ConditionService.hasGroupsPassed( act.startConditionGroups );

				if ( act.shouldStart ) this.startAct( act );

			} else {

				this.updateAct( act );

			}

		} );
	}

	private startAct ( act: Act ) {

		if ( this.logEvents ) console.info( 'started-act', act.name );

		act.hasStarted = true;

		// fire event

		this.updateAct( act );
	}

	private updateAct ( act: Act ) {

		if ( this.logEvents ) console.info( 'running-act', act.name );

		act.sequences.forEach( sequence => {

			this.updateSequence( sequence );

		} );

	}

	private updateSequence ( sequence: Sequence ) {

		sequence.maneuvers.forEach( maneuver => {

			if ( maneuver.hasStarted ) {

				this.updateManeuver( maneuver, sequence );

			} else {

				this.startManeuver( maneuver, sequence );

			}

		} );
	}

	private startManeuver ( maneuver: Maneuver, sequence: Sequence ) {

		if ( this.logEvents ) console.info( 'started-manuever', maneuver.name );

		// TODO: Fire event

		maneuver.hasStarted = true;

		this.updateManeuver( maneuver, sequence );
	}

	private updateManeuver ( maneuver: Maneuver, sequence: Sequence ) {

		if ( this.logEvents ) console.info( 'running-maneuver', maneuver.name );

		if ( maneuver.isCompleted ) return;

		if ( maneuver.events.length == 0 ) {

			maneuver.isCompleted = true;

			return;

		}

		// let event = maneuver.events[ maneuver.eventIndex ];

		// if ( event.isCompleted ) maneuver.eventIndex++;

		if ( maneuver.eventIndex < maneuver.events.length ) {

			const event = maneuver.events[ maneuver.eventIndex ];

			if ( event.hasStarted ) this.updateEvent( event, sequence );

			if ( !event.hasStarted ) {

				const shouldStart = event.hasPassed();

				if ( shouldStart ) this.startEvent( event, sequence );
			}

		} else {

			throw new Error( 'Maneuver has no more events' );

			// maneuver.isCompleted = true;

			// TODO: fire event

		}

	}


	private startEvent ( event: TvEvent, sequence: Sequence ) {

		if ( this.logEvents ) console.info( 'started-event', event.name );

		// TODO: Fire event

		event.hasStarted = true;

		this.updateEvent( event, sequence );

	}

	private updateEvent ( event: TvEvent, sequence: Sequence ) {

		if ( this.logEvents ) console.info( 'running-event', event.name );

		event.getActionMap().forEach( ( action, actionName ) => {

			if ( action.isCompleted ) return;

			if ( !action.hasStarted ) {

				this.startAction( action, actionName, sequence );

			} else {

				this.updateAction( action, actionName, sequence );

			}

		} );

		// Another to run this loop just for referenc
		// const actions = event.getActionMap();

		// for ( const i of actions ) {

		//     const actionName = i[ 0 ];
		//     const action = i[ 1 ];

		//     if ( action.isCompleted ) continue;

		//     if ( !action.hasStarted ) {

		//         this.startAction( action, actionName, sequence );

		//     } else {

		//         this.updateAction( action, actionName, sequence );

		//     }
		// }

	}

	private startAction ( action: AbstractAction, actionName: string, sequence: Sequence ) {

		if ( this.logEvents ) console.info( 'started-action', actionName );

		// TODO: Fire event

		// action.hasStarted = true;

		this.updateAction( action, actionName, sequence );

	}

	private updateAction ( action: AbstractAction, actionName: string, sequence: Sequence ) {

		if ( this.logEvents ) console.info( 'running-action', actionName );

		sequence.actors.forEach( actorName => {

			if ( !this.openScenario.objects.has( actorName ) ) throw new Error( 'Object not found' );

			const entity = this.openScenario.objects.get( actorName );

			action.execute( entity );

		} );
	}

	private resetOpenScenario () {

		( new ResetHelper( this.openScenario ) ).reset();

	}

	private setRoadProperties ( obj: EntityObject ) {

		const roadCoord = new TvPosTheta();

		const pos = obj.gameObject.position;

		const res = TvMapQueries.getLaneByCoords( pos.x, pos.y, roadCoord );

		if ( !res.road || !res.lane ) return;

		obj.roadId = res.road.id;

		obj.laneId = res.lane.id;

		obj.laneSectionId = res.road.getLaneSectionAt( roadCoord.s ).id;

		obj.direction = res.lane.id > 0 ? -1 : 1;

		obj.sCoordinate = roadCoord.s;

	}


}

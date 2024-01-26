/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { PlayerService, PlayerUpdateData } from '../../core/player.service';
import { TvPosTheta } from '../../map/models/tv-pos-theta';
import { TvMapQueries } from '../../map/queries/tv-map-queries';
import { ConditionUtils } from '../builders/condition-utils';
import { ResetHelper } from '../helpers/tv-reset-helper';
import { ScenarioEntity } from '../models/entities/scenario-entity';
import { VehicleEntity } from '../models/entities/vehicle-entity';
import { Act } from '../models/tv-act';
import { TvAction } from '../models/tv-action';
import { StoryboardElementState, StoryboardElementType } from '../models/tv-enums';
import { TvEvent } from '../models/tv-event';
import { Maneuver } from '../models/tv-maneuver';
import { ManeuverGroup } from '../models/tv-sequence';
import { Story } from '../models/tv-story';
import { ScenarioEvents } from './scenario-events';
import { ScenarioService } from './scenario.service';
import { MapService } from "../../services/map/map.service";

export interface StoryboardEvent {
	name: string;
	type: StoryboardElementType;
	state: StoryboardElementState;
}

@Injectable( {
	providedIn: 'root'
} )
export class ScenarioDirectorService {

	static vehicleTraffic: Map<number, VehicleEntity[]> = new Map<number, VehicleEntity[]>();

	private added: boolean;

	private eventIndex: number = 0;

	private logEvents: boolean = false;

	get scenario () {
		return this.scenarioService.getScenario();
	}

	constructor (
		public userPlayer: PlayerService,
		private mapService: MapService,
		private scenarioService: ScenarioService
	) {

		userPlayer.playerStarted.subscribe( e => this.onPlayerStarted() );
		userPlayer.playerResumed.subscribe( e => this.onPlayerResumed() );
		userPlayer.playerStopped.subscribe( e => this.onPlayerStopped() );
		userPlayer.playerPaused.subscribe( e => this.onPlayerPaused() );
		userPlayer.playerTick.subscribe( e => this.onPlayerTick( e ) );

	}

	private static setRoadProperties ( obj: ScenarioEntity ) {

		const roadCoord = new TvPosTheta();

		const pos = obj.position;

		const res = TvMapQueries.getLaneByCoords( pos.x, pos.y, roadCoord );

		if ( !res.road || !res.lane ) return;

		obj.openDriveProperties.isOpenDrive = true;

		obj.setRoadId( res.road.id );

		obj.setLaneId( res.lane.id );

		obj.setLaneSectionId( res.road.getLaneSectionAt( roadCoord.s ).id );

		obj.setDirection( res.lane.id > 0 ? -1 : 1 );

		obj.setSValue( roadCoord.s );

	}

	private onPlayerStarted () {

		if ( this.logEvents ) console.info( 'scenario-started', this.scenarioService );

		this.startScenario();
		this.updateScenario();
	}

	private onPlayerResumed () {

		if ( this.logEvents ) console.info( 'scenario-resumed' );

	}

	private onPlayerPaused () {

		if ( this.logEvents ) console.info( 'scenario-paused' );

	}

	private onPlayerStopped () {

		if ( this.logEvents ) console.info( 'scenario-stopped' );

		this.resetScenario();
	}

	private onPlayerTick ( e: PlayerUpdateData ) {

		this.updateScenario();

	}

	private updateScenario () {

		this.scenario.objects.forEach( ( entity ) => {

			entity.initActions.filter( action => !action.isCompleted ).forEach( ( action ) => {

				action.execute( entity );

			} );

		} );

		if ( ConditionUtils.hasGroupsPassed( this.scenarioService.getScenario().storyboard.endConditionGroups ) ) {

			this.userPlayer.stop();

		} else {

			this.scenario.storyboard.stories.forEach( story => {

				this.runStory( story );

			} );

			this.scenario.objects.forEach( obj => {

				obj.onUpdate();

			} );

		}
	}

	private startScenario () {

		ScenarioEvents.fire( {
			name: 'scenario-started',
			type: StoryboardElementType.scenario,
			state: StoryboardElementState.startTransition
		} );

		// // set parameters
		// this.reader.replaceParamaterValues( this.openScenario.objects, ( object, property ) => {
		//     console.log( 'replaced', object, property );
		// } );

		// set road traffic state
		// this.openDrive.roads.forEach( road => PlayerService.traffic.set( road.id, [] ) );

		this.scenario.objects.forEach( obj => {

			ScenarioDirectorService.setRoadProperties( obj );

			obj.onStart();

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

				act.shouldStart = ConditionUtils.hasGroupsPassed( act.startConditionGroups );

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

		act.maneueverGroups.forEach( sequence => {

			this.updateSequence( sequence );

		} );

	}

	private updateSequence ( sequence: ManeuverGroup ) {

		sequence.maneuvers.forEach( maneuver => {

			if ( maneuver.hasStarted ) {

				this.updateManeuver( maneuver, sequence );

			} else {

				this.startManeuver( maneuver, sequence );

			}

		} );
	}

	private startManeuver ( maneuver: Maneuver, sequence: ManeuverGroup ) {

		if ( this.logEvents ) console.info( 'started-manuever', maneuver.name );

		// TODO: Fire event

		maneuver.hasStarted = true;

		this.updateManeuver( maneuver, sequence );
	}

	private updateManeuver ( maneuver: Maneuver, sequence: ManeuverGroup ) {

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

	private startEvent ( event: TvEvent, sequence: ManeuverGroup ) {

		if ( this.logEvents ) console.info( 'started-event', event.name );

		// TODO: Fire event

		event.hasStarted = true;

		this.updateEvent( event, sequence );

	}

	private updateEvent ( event: TvEvent, sequence: ManeuverGroup ) {

		if ( this.logEvents ) console.info( 'running-event', event.name );

		event.getActionMap().forEach( ( action ) => {

			if ( action.isCompleted ) return;

			if ( !action.hasStarted ) {

				this.startAction( action, action.name, sequence );

			} else {

				this.updateAction( action, action.name, sequence );

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

	private startAction ( action: TvAction, actionName: string, sequence: ManeuverGroup ) {

		if ( this.logEvents ) console.info( 'started-action', actionName );

		// TODO: Fire event

		// action.hasStarted = true;

		this.updateAction( action, actionName, sequence );

	}

	private updateAction ( action: TvAction, actionName: string, sequence: ManeuverGroup ) {

		if ( this.logEvents ) console.info( 'running-action', actionName );

		sequence.actors.forEach( actorName => {

			if ( !this.scenario.objects.has( actorName ) ) throw new Error( 'Object not found' );

			const entity = this.scenario.objects.get( actorName );

			action.execute( entity );

		} );
	}

	private resetScenario () {

		( new ResetHelper( this.scenario ) ).reset();

	}

}

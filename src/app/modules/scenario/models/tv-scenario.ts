/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils, Scene, Vector3 } from 'three';
import { SceneService } from '../../../core/services/scene.service';
import { ActionService } from '../builders/action-service';
import { PrivateAction } from './private-action';
import { Act } from './tv-act';
import { TvAction } from './tv-action';
import { Catalogs } from './tv-catalogs';
import { File } from './tv-common';
import { ScenarioEntity } from './entities/scenario-entity';
import { TvEvent } from './tv-event';
import { FileHeader } from './tv-file-header';
import { Maneuver } from './tv-maneuver';
import { NameDB } from './tv-name-db';
import { ParameterDeclaration } from './tv-parameter-declaration';
import { RoadNetwork } from './tv-road-network';
import { ManeuverGroup } from './tv-sequence';
import { Story } from './tv-story';
import { Storyboard } from './tv-storyboard';

export class TvScenario {

	public fileHeader = new FileHeader;
	public catalogs: Catalogs;
	public parameterDeclarations: ParameterDeclaration[] = [];
	public roadNetwork: RoadNetwork;
	public storyboard = new Storyboard;
	public objects: Map<string, ScenarioEntity> = new Map<string, ScenarioEntity>();

	public db: NameDB = new NameDB();

	// get parameters () {
	// 	return this.parameterDeclaration.parameters;
	// }
	//
	// findParameter ( name: string ) {
	//
	// 	const result = this.parameters.find( parameter => parameter.name === name );
	//
	// 	if ( result == null || undefined ) throw new Error( 'Param with given value not found '.concat( name ) );
	//
	// 	return result;
	// }

	setRoadNetworkPath ( path: string ) {
		this.roadNetwork = new RoadNetwork( new File( path ), null );
	}

	addParameterDeclaration ( declaration: ParameterDeclaration ): void {
		this.parameterDeclarations.push( declaration );
	}

	/**
	 *
	 * @deprecated
	 */
	addEntity ( object: ScenarioEntity ): any {
		this.addObject( object );
		// old code just for reference
		// this.m_Entities.addObject( object );
	}

	findEntityOrFail ( entityName: string ) {

		if ( !this.hasEntity( entityName ) ) throw new Error( `${ entityName } entity not found` );

		return this.objects.get( entityName );
	}

	hasEntity ( entityName: string ) {

		return this.objects.has( entityName );

	}

	addObject ( object: ScenarioEntity ) {

		// const hasName = ScenarioInstance.scenario.db.has_entity( object.name );

		// if ( hasName ) throw new Error( `Entity name : ${ object.name } already used` );

		this.objects.set( object.name, object );

		// ScenarioInstance.db.add_entity( object.name, object );

		SceneService.add( object );

	}

	getActionsByEntity ( name: string ) {

		let actions: TvAction[] = [];

		this.getManeuversForEntity( name ).forEach( maneuver => {

			maneuver.events.forEach( event => {

				event.getActions().forEach( action => {

					actions.push( action );

				} );

			} );

		} );

		return actions;
	}

	removeObject ( object: ScenarioEntity ) {

		// ScenarioInstance.db.remove_entity( object.name );

		this.objects.delete( object.name );

	}

	getStoriesByOwner ( owner: string ): Story[] {

		let stories = [];

		this.storyboard.stories.forEach( ( story ) => {

			if ( story.ownerName != null && story.ownerName == owner ) {

				stories.push( story );

			}

		} );

		return stories;
	}

	getSequencesByActor ( actorName: string ): ManeuverGroup[] {

		let sequences = [];

		this.storyboard.stories.forEach( ( story ) => {

			story.acts.forEach( ( act ) => {

				act.maneueverGroups.forEach( ( sequence ) => {

					sequence.actors.forEach( ( name ) => {

						let actorNameMatches = name === actorName;
						let ownerNameMatches = story.ownerName == actorName;

						if ( actorNameMatches || ownerNameMatches ) {
							sequences.push( sequence );
						}

					} );

				} );

			} );

		} );

		return sequences;
	}

	getManeuversForEntity ( name: string ): Maneuver[] {

		let maneuvers = [];

		let sequences = this.getSequencesByActor( name );

		sequences.forEach( ( sequence ) => {

			sequence.maneuvers.forEach( ( maneuver ) => {

				maneuvers.push( maneuver );

			} );

		} );

		return maneuvers;
	}

	getActsByOwner ( name: string ): Act[] {

		const stories = this.getStoriesByOwner( name );

		const acts = [];

		stories.forEach( story => {

			story.acts.forEach( act => {

				acts.push( act );

			} );

		} );

		return acts;

	}

	clear () {

		this.db.clear();

		this.parameterDeclarations.splice( 0, this.parameterDeclarations.length );

		this.objects.forEach( entity => {

			SceneService.remove( entity );

			entity.initActions.splice( 0, entity.initActions.length );

		} );

		this.storyboard.stories.forEach( story => {

			story.acts.splice( 0, story.acts.length );

		} );

		this.objects.clear();

		this.storyboard.stories.clear();

	}

	destroy () {

		this.clear();

	}

	createStory ( entity: ScenarioEntity ): Story {

		const storyName = `Story${ this.storyboard.stories.size + 1 }`;

		const story = new Story( storyName, entity.name );

		this.storyboard.addStory( story );

		return story;
	}

	findEntityActions ( entity: ScenarioEntity ): PrivateAction[] {

		const actions: PrivateAction[] = [];

		const maneuvers = this.getManeuversForEntity( entity.name );

		maneuvers.forEach( maneuver => {

			maneuver.events.forEach( event => {

				event.actions.forEach( action => {

					actions.push( action as PrivateAction );

				} );

			} );

		} );

		return actions;
	}

	addActionEvent ( entity: ScenarioEntity, action: PrivateAction ): void {

		const maneuvers = this.getManeuversForEntity( entity.name );

		if ( maneuvers.length > 0 ) {

			const event = maneuvers[ 0 ].addNewEvent( `Event-${ MathUtils.randInt( 1, 100 ) }` );

			event.addNewAction( `Action-${ MathUtils.randInt( 1, 100 ) }`, action );

			// event.addStartCondition( new SimulationTimeCondition( 0, Rule.greater_than ) );

		}


	}

	findEntityEvents ( entity: ScenarioEntity ): TvEvent[] {

		const events: TvEvent[] = [];

		const maneuvers = this.getManeuversForEntity( entity.name );

		maneuvers.forEach( maneuver => {

			maneuver.events.forEach( event => {

				events.push( event );

			} );

		} );

		return events;


	}

	getEntityVectorPosition ( entityName: string ): Vector3 {

		return this.findEntityOrFail( entityName ).position;

	}

	executeInitActions () {

		this.objects.forEach( ( entity ) => {

			entity.initActions.forEach( ( action ) => {

				// this can be used to execute actions that are not in the storyboard
				// action.execute( entity );

				ActionService.executePrivateAction( entity, action );

			} );

		} );

	}
}

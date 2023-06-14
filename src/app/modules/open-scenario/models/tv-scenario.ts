/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils } from 'three';
import { TvScenarioInstance } from '../services/tv-scenario-instance';
import { SimulationTimeCondition } from './conditions/tv-simulation-time-condition';
import { Act } from './tv-act';
import { Catalogs } from './tv-catalogs';
import { File } from './tv-common';
import { EntityObject } from './tv-entities';
import { Rule } from './tv-enums';
import { TvEvent } from './tv-event';
import { FileHeader } from './tv-file-header';
import { AbstractAction, AbstractPrivateAction } from './tv-interfaces';
import { Maneuver } from './tv-maneuver';
import { Parameter, ParameterDeclaration } from './tv-parameter-declaration';
import { RoadNetwork } from './tv-road-network';
import { Sequence } from './tv-sequence';
import { Story } from './tv-story';
import { Storyboard } from './tv-storyboard';

export class OpenScenario {

	public fileHeader = new FileHeader;
	public catalogs: Catalogs;
	public parameterDeclaration = new ParameterDeclaration();
	public roadNetwork: RoadNetwork;
	public storyboard = new Storyboard;
	public objects: Map<string, EntityObject> = new Map<string, EntityObject>();

	get parameters () {
		return this.parameterDeclaration.parameters;
	}

	findParameter ( name: string ) {

		const result = this.parameters.find( parameter => parameter.name === name );

		if ( result == null || undefined ) throw new Error( 'Param with given value not found '.concat( name ) );

		return result;
	}

	setRoadNetworkPath ( path: string ) {
		this.roadNetwork = new RoadNetwork( new File( path ), null );
	}

	addParameter ( parameter: Parameter ): void {
		this.parameterDeclaration.addParameter( parameter );
	}

	// deprecated
	addEntity ( object: EntityObject ): any {
		this.addObject( object );
		// old code just for reference
		// this.m_Entities.addObject( object );
	}

	findEntityOrFail ( entityName: string ) {

		if ( !this.hasEntity( entityName ) ) throw new Error( entityName.concat( ' not found' ) );

		return this.objects.get( entityName );
	}

	hasEntity ( entityName: string ) {

		return this.objects.has( entityName );

	}

	addObject ( object: EntityObject ) {

		const hasName = TvScenarioInstance.db.has_entity( object.name );

		if ( hasName ) throw new Error( `Entity name : ${ object.name } already used` );

		this.objects.set( object.name, object );

		TvScenarioInstance.db.add_entity( object.name, object );

	}

	getActionsByEntity ( name: string ) {

		let actions: AbstractAction[] = [];

		this.getManeuversForEntity( name ).forEach( maneuver => {

			maneuver.events.forEach( event => {

				event.getActions().forEach( action => {

					actions.push( action );

				} );

			} );

		} );

		return actions;
	}

	removeObject ( object: EntityObject ) {

		TvScenarioInstance.db.remove_entity( object.name );

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

	getSequencesByActor ( actorName: string ): Sequence[] {

		let sequences = [];

		this.storyboard.stories.forEach( ( story ) => {

			story.acts.forEach( ( act ) => {

				act.sequences.forEach( ( sequence ) => {

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


	}

	destroy () {

	}

	createStory ( entity: EntityObject ): Story {

		const storyName = `Story${ this.storyboard.stories.size + 1 }`;

		const story = new Story( storyName, entity.name );

		this.storyboard.addStory( story );

		return story;
	}

	findEntityActions ( entity: EntityObject ): AbstractPrivateAction[] {

		const actions: AbstractPrivateAction[] = [];

		const maneuvers = this.getManeuversForEntity( entity.name );

		maneuvers.forEach( maneuver => {

			maneuver.events.forEach( event => {

				event.actions.forEach( action => {

					actions.push( action as AbstractPrivateAction );

				} );

			} );

		} );

		return actions;
	}

	addActionEvent ( entity: EntityObject, action: AbstractPrivateAction ): void {

		const maneuvers = this.getManeuversForEntity( entity.name );

		if ( maneuvers.length > 0 ) {

			const event = maneuvers[ 0 ].addNewEvent( `Event-${ MathUtils.generateUUID() }`, 'overwrite' );

			event.addNewAction( `Action-${ MathUtils.generateUUID() }`, action );

			event.addStartCondition( new SimulationTimeCondition( 0, Rule.greater_than ) );

		}


	}

	findEntityEvents ( entity: EntityObject ): TvEvent[] {

		const events: TvEvent[] = [];

		const maneuvers = this.getManeuversForEntity( entity.name );

		maneuvers.forEach( maneuver => {

			maneuver.events.forEach( event => {

				events.push( event );

			} );

		} );

		return events;


	}
}
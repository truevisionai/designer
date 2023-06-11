/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OscSourceFile } from '../services/osc-source-file';
import { OscAct } from './osc-act';
import { OscCatalogs } from './osc-catalogs';
import { OscFile } from './osc-common';
import { OscEntityObject } from './osc-entities';
import { OscFileHeader } from './osc-file-header';
import { AbstractAction } from './osc-interfaces';
import { OscManeuver } from './osc-maneuver';
import { OscParameter, OscParameterDeclaration } from './osc-parameter-declaration';
import { OscRoadNetwork } from './osc-road-network';
import { OscSequence } from './osc-sequence';
import { OscStory } from './osc-story';
import { OscStoryboard } from './osc-storyboard';

export class OpenScenario {

	public fileHeader = new OscFileHeader;
	public catalogs: OscCatalogs;
	public parameterDeclaration = new OscParameterDeclaration();
	public roadNetwork: OscRoadNetwork;
	public storyboard = new OscStoryboard;
	public objects: Map<string, OscEntityObject> = new Map<string, OscEntityObject>();

	get parameters () {
		return this.parameterDeclaration.parameters;
	}

	findParameter ( name: string ) {

		const result = this.parameters.find( parameter => parameter.name === name );

		if ( result == null || undefined ) throw new Error( 'Param with given value not found '.concat( name ) );

		return result;
	}

	setRoadNetworkPath ( path: string ) {
		this.roadNetwork = new OscRoadNetwork( new OscFile( path ), null );
	}

	addParameter ( parameter: OscParameter ): void {
		this.parameterDeclaration.addParameter( parameter );
	}

	// deprecated
	addEntity ( object: OscEntityObject ): any {
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

	addObject ( object: OscEntityObject ) {

		const hasName = OscSourceFile.db.has_entity( object.name );

		if ( hasName ) throw new Error( `Entity name : ${ object.name } already used` );

		this.objects.set( object.name, object );

		OscSourceFile.db.add_entity( object.name, object );

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

	removeObject ( object: OscEntityObject ) {

		OscSourceFile.db.remove_entity( object.name );

		this.objects.delete( object.name );

	}

	getStoriesByOwner ( owner: string ): OscStory[] {

		let stories = [];

		this.storyboard.stories.forEach( ( story ) => {

			if ( story.ownerName != null && story.ownerName == owner ) {

				stories.push( story );

			}

		} );

		return stories;
	}

	getSequencesByActor ( actorName: string ): OscSequence[] {

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

	getManeuversForEntity ( name: string ): OscManeuver[] {

		let maneuvers = [];

		let sequences = this.getSequencesByActor( name );

		sequences.forEach( ( sequence ) => {

			sequence.maneuvers.forEach( ( maneuver ) => {

				maneuvers.push( maneuver );

			} );

		} );

		return maneuvers;
	}

	getActsByOwner ( name: string ): OscAct[] {

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
}

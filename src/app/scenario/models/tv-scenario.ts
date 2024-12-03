/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { TvPosTheta } from '../../map/models/tv-pos-theta';
import { TvMapQueries } from '../../map/queries/tv-map-queries';
import { TeleportAction } from './actions/tv-teleport-action';
import { ScenarioEntity } from './entities/scenario-entity';
import { Position } from './position';
import { PrivateAction } from './private-action';
import { Act } from './tv-act';
import { TvAction } from './tv-action';
import { Catalogs } from './tv-catalogs';
import { File } from './tv-common';
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

	constructor () {
	}

	setRoadNetworkPath ( path: string ): void {
		this.roadNetwork = new RoadNetwork( new File( path ), null );
	}

	addParameterDeclaration ( declaration: ParameterDeclaration ): void {
		this.parameterDeclarations.push( declaration );
	}

	getParameterDeclaration ( name: string ): ParameterDeclaration {
		return this.parameterDeclarations.find( param => param.name === name );
	}

	addStory ( story: Story ): void {

		this.storyboard.addStory( story );

	}

	findEntityOrFail ( entityName: string ): ScenarioEntity {

		if ( !this.hasEntity( entityName ) ) throw new Error( `${ entityName } entity not found` );

		return this.objects.get( entityName );
	}

	hasEntity ( entityName: string ): boolean {

		return this.objects.has( entityName );

	}

	addObject ( object: ScenarioEntity ): void {

		this.objects.set( object.name, object );

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

	executeInitActions (): void {

		this.objects.forEach( entity => {

			entity.initActions.filter( i => i instanceof PrivateAction ).forEach( ( action: PrivateAction ) => {

			} );

		} );

		const laterActions: { entity: ScenarioEntity, action: TvAction }[] = [];

		this.objects.forEach( ( entity ) => {

			entity.initActions.forEach( ( action ) => {

				if ( action instanceof TeleportAction ) {

					if ( !action.position.isDependent ) {

						action.execute( entity );

						this.setRoadProperties( entity, action.position );

					} else {

						laterActions.push( { entity, action } );

					}

				} else {

					action.execute( entity );

				}

			} );

		} );

		for ( let i = 0; i < laterActions.length; i++ ) {

			const action = laterActions[ i ].action;
			const entity = laterActions[ i ].entity;

			action.execute( entity );

			if ( action instanceof TeleportAction ) {
				this.setRoadProperties( entity, action.position );
			}

		}

	}

	setRoadProperties ( entity: ScenarioEntity, position: Position ): void {

		const roadCoord = new TvPosTheta();

		const pos = position.position;

		const res = TvMapQueries.getLaneByCoords( pos.x, pos.y, roadCoord );

		if ( !res.road || !res.lane ) return;

		entity.openDriveProperties.isOpenDrive = true;

		entity.setRoadId( res.road.id );

		entity.setLaneId( res.lane.id );

		entity.setLaneSectionId( res.road.getLaneProfile().getLaneSectionAt( roadCoord.s ).id );

		entity.setDirection( res.lane.id > 0 ? -1 : 1 );

		entity.setSValue( roadCoord.s );

	}
}

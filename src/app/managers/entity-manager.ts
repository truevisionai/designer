/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MapEvents, RoadUpdatedEvent } from 'app/events/map-events';
import { ScenarioEntity } from 'app/modules/scenario/models/entities/scenario-entity';
import { ActionType } from 'app/modules/scenario/models/tv-enums';
// import { ScenarioInstance } from 'app/modules/scenario/services/scenario-instance';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Manager } from './manager';

export class EntityManager extends Manager {

	private static _instance = new EntityManager();

	private debug = false;

	private entity?: ScenarioEntity;

	static get instance (): EntityManager {
		return this._instance;
	}

	constructor () {

		super();

	}

	public init (): void {

		MapEvents.roadUpdated.subscribe( e => this.onRoadUpdated( e ) );

	}


	onRoadUpdated ( event: RoadUpdatedEvent ): void {

		if ( this.debug ) console.debug( 'onRoadUpdated' );

		// we want to teleport all entities to the new position
		// when road is updated
		// ScenarioInstance.scenario.objects.forEach( ( entity: ScenarioEntity ) => {

		// 	this.updateEntityPosition( entity, event.road );

		// } );

	}

	updateEntityPosition ( entity: ScenarioEntity, road: TvRoad ) {

		const teleportAction = entity.initActions
			.find( action => action.actionType == ActionType.Private_Position );

		teleportAction?.execute( entity );
	}

	setEntity ( entity: ScenarioEntity ) {

		this.entity = entity;

	}

	getEntity<T extends ScenarioEntity> (): T {

		return this.entity as T;

	}
}

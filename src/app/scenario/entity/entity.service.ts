/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Object3DMap } from 'app/core/models/object3d-map';
import { VehicleEntity } from '../models/entities/vehicle-entity';
import { Object3D, Vector3 } from 'three';
import { Orientation } from '../models/tv-orientation';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvLane } from 'app/map/models/tv-lane';
import { ScenarioObjectType, VehicleCategory } from "../models/tv-enums";
import { EntityFactory } from 'app/scenario/entity/entity.factory';
import { ScenarioService } from '../services/scenario.service';
import { RoadDistance } from 'app/map/road/road-distance';
import { ScenarioEntity } from '../models/entities/scenario-entity';

@Injectable( {
	providedIn: 'root'
} )
export class EntityService {

	private vehicles: Object3DMap<VehicleEntity, Object3D> = new Object3DMap();

	constructor (
		private entityFactory: EntityFactory,
		private scenarioService: ScenarioService,
	) {
	}

	get entities () {
		return this.scenarioService.entities;
	}

	createVehicle (): any {

		return this.entityFactory.createDefaultCar();

	}

	createEntityByType ( type: ScenarioObjectType ): any {

		switch ( type ) {

			case ScenarioObjectType.vehicle:
				return this.createVehicle();

		}

	}

	createVehicleAt ( position: Vector3, orientation: Orientation ): any {

		return this.entityFactory.createVehicleAt( position, orientation );

	}

	createVehicleByType ( category: VehicleCategory ): any {

		return this.entityFactory.createVehicle( category );

	}

	createVehicleOnLane ( road: TvRoad, lane: TvLane, s: number = 0, offset: number = 0 ): any {

		const position = road.getLaneCenterPosition( lane, s as RoadDistance, offset ).position;

		return this.createVehicleAt( position, new Orientation() );

	}

	removeAll (): void {

		this.vehicles.clear();

	}

	findEntityByName ( name: string ): ScenarioEntity {

		return this.entities.find( entity => entity.name === name );

	}
}

import { Injectable } from '@angular/core';
import { VehicleFactory } from 'app/factories/vehicle.factory';
import { Object3DMap } from 'app/tools/lane-width/object-3d-map';
import { VehicleEntity } from '../models/entities/vehicle-entity';
import { Object3D, Vector3 } from 'three';
import { Orientation } from '../models/tv-orientation';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';

@Injectable( {
	providedIn: 'root'
} )
export class VehicleService {

	private vehicles: Object3DMap<VehicleEntity, Object3D> = new Object3DMap();

	constructor () { }

	createVehicle () {

		return VehicleFactory.createDefaultCar();

	}

	createVehicleAt ( position: Vector3, orientation: Orientation ) {

		return VehicleFactory.createVehicleAt( position, orientation );

	}

	createVehicleOnLane ( road: TvRoad, lane: TvLane, s = 0, offset = 0 ) {

		const position = road.getLaneCenterPosition( lane, s, offset ).position;

		return VehicleFactory.createVehicleAt( position, new Orientation() );

	}

	addVehicle ( vehicle: VehicleEntity ) {

		this.vehicles.add( vehicle, vehicle );

	}

	getVehicles () {

		return this.vehicles.keys()

	}

	removeAll () {

		this.vehicles.clear();

	}


}

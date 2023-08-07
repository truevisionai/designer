/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DefaultVehicleController } from "app/modules/scenario/controllers/default-vehicle-controller";
import { VehicleEntity } from "app/modules/scenario/models/entities/vehicle-entity";
import { TvAxle, TvAxles, TvBoundingBox, TvDimension, TvPerformance } from "app/modules/scenario/models/tv-bounding-box";
import { VehicleCategory } from "app/modules/scenario/models/tv-enums";
import { Vector3 } from "three";

export class VehicleFactory {

	static createDefaultCar ( name?: string ): VehicleEntity {

		const vehicleName = name || VehicleEntity.getNewName( 'Vehicle' );

		const boundingBox = new TvBoundingBox(
			new Vector3( 1.3, 0.0, 0.75 ),
			new TvDimension( 1.8, 4.5, 1.5 )
		);

		const performance = new TvPerformance( 69, 5, 10 );

		const axles = new TvAxles(
			new TvAxle( 0.523598775598, 0.8, 1.68, 2.98, 0.4 ),
			new TvAxle( 0.523598775598, 0.8, 1.68, 0, 0.4 ),
		);

		const vehicleEntity = new VehicleEntity( vehicleName, VehicleCategory.car, boundingBox, performance, axles );

		vehicleEntity.setController( new DefaultVehicleController( 'DefaultVehicleController', vehicleEntity ) );

		return vehicleEntity;
	}
}

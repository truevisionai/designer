/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AssetDatabase } from 'app/core/asset/asset-database';
import { ActionFactory } from 'app/scenario/builders/action-factory';
import { DefaultVehicleController } from 'app/scenario/controllers/default-vehicle-controller';
import { VehicleEntity } from 'app/scenario/models/entities/vehicle-entity';
import { TvAxle, TvAxles, TvBoundingBox, TvDimension, TvPerformance } from 'app/scenario/models/tv-bounding-box';
import { ActionType, VehicleCategory } from 'app/scenario/models/tv-enums';
import { Orientation } from 'app/scenario/models/tv-orientation';
import { EntityManager } from 'app/managers/entity-manager';
import { Object3D, Vector3 } from 'three';
import { IDService } from './id.service';

export class VehicleFactory {

	private static entityId = new IDService();

	static reset () {

		this.entityId.reset();

	}

	static createVehicleAt ( vector3: Vector3, orientation?: Orientation ): VehicleEntity {

		const vehicle: VehicleEntity = this.getSelectedVehicle();

		vehicle.position.copy( vector3 );

		vehicle.rotation.copy( orientation.toEuler() );

		vehicle.addInitAction( ActionFactory.createPositionAction( vehicle, vector3, orientation ) );

		vehicle.addInitAction( ActionFactory.createActionWithoutName( ActionType.Private_Longitudinal_Speed, vehicle ) );

		return vehicle;

	}

	static getSelectedVehicle (): VehicleEntity {

		const selectedVehicle = EntityManager.instance.getEntity<VehicleEntity>();

		if ( !selectedVehicle ) return this.createDefaultCar();

		if ( selectedVehicle.model3d && selectedVehicle.model3d !== 'default' ) {

			const vehicle = selectedVehicle?.clone();

			const mesh = AssetDatabase.getInstance<Object3D>( selectedVehicle.model3d ).clone();

			vehicle.name = this.entityId.getName( 'Vehicle' );

			vehicle.geometry.dispose();

			vehicle.add( mesh );

			return vehicle;

		} else {

			const vehicle = selectedVehicle?.clone();

			vehicle.name = this.entityId.getName( 'Vehicle' );

			return vehicle;

		}

	}

	static createVehicle ( category: VehicleCategory ): VehicleEntity {

		switch ( category ) {

			case VehicleCategory.car:
				return this.createDefaultCar()
				break;

			case VehicleCategory.truck:
				return this.createDefaultTruck()
				break;

			default:
				return this.createDefaultCar()
				break;

		}

	}

	static createDefaultCar ( name?: string, category = VehicleCategory.car ): VehicleEntity {

		const vehicleName = name || this.entityId.getName( 'Vehicle' );

		const boundingBox = new TvBoundingBox(
			new Vector3( 1.3, 0.0, 0.75 ),
			new TvDimension( 1.8, 4.5, 1.5 )
		);

		const performance = new TvPerformance( 69, 5, 10 );

		const axles = new TvAxles(
			new TvAxle( 0.523598775598, 0.8, 1.68, 2.98, 0.4 ),
			new TvAxle( 0.523598775598, 0.8, 1.68, 0, 0.4 ),
		);

		const vehicleEntity = new VehicleEntity( vehicleName, category, boundingBox, performance, axles );

		vehicleEntity.setController( new DefaultVehicleController( 'DefaultVehicleController', vehicleEntity ) );

		return vehicleEntity;
	}

	static createDefaultTruck ( name?: string, category = VehicleCategory.truck ): VehicleEntity {

		const vehicleName = name || this.entityId.getName( 'Truck' );

		const boundingBox = new TvBoundingBox(
			new Vector3( 1.3, 0.0, 0.75 ),
			new TvDimension( 1.8, 4.5, 1.5 )
		);

		const performance = new TvPerformance( 69, 5, 10 );

		const axles = new TvAxles(
			new TvAxle( 0.523598775598, 0.8, 1.68, 2.98, 0.4 ),
			new TvAxle( 0.523598775598, 0.8, 1.68, 0, 0.4 ),
		);

		const vehicleEntity = new VehicleEntity( vehicleName, category, boundingBox, performance, axles );

		vehicleEntity.setController( new DefaultVehicleController( 'DefaultVehicleController', vehicleEntity ) );

		return vehicleEntity;

	}
}

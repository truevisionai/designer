import { ScenarioObjectType, VehicleCategory } from "app/modules/scenario/models/tv-enums";
import { VehicleFactory } from "./vehicle.factory";
import { ScenarioEntity } from "app/modules/scenario/models/entities/scenario-entity";

export class Entityfactory {

	static createEntity ( type: ScenarioObjectType ): ScenarioEntity {

		switch ( type ) {

			case ScenarioObjectType.pedestrian:
				break;

			case ScenarioObjectType.miscellaneous:
				break;

			case ScenarioObjectType.vehicle:
				return this.createVehicle( VehicleCategory.car );

			default:
				return null;

		}

	}

	static createVehicle ( category: VehicleCategory ): ScenarioEntity {

		return VehicleFactory.createVehicle( category );

	}

}

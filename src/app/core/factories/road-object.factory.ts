import { TvRoadObject } from 'app/modules/tv-map/models/tv-road-object';
import { Object3D } from 'three';
import { ObjectTypes } from '../../modules/tv-map/models/tv-common';
import { MarkingObjectFactory } from './marking-object.factory';


export class RoadObjectFactory {

	static create ( roadObject: TvRoadObject ): Object3D {

		const type: ObjectTypes = roadObject.attr_type;

		switch ( type ) {
			case ObjectTypes.ROAD:
				break;
			case ObjectTypes.LANE:
				break;
			case ObjectTypes.LANE_MARKING:
				break;
			case ObjectTypes.VEHICLE:
				break;
			case ObjectTypes.barrier:
				break;
			case ObjectTypes.bike:
				break;
			case ObjectTypes.building:
				break;
			case ObjectTypes.bus:
				break;
			case ObjectTypes.car:
				break;
			case ObjectTypes.crosswalk:
				return MarkingObjectFactory.create( roadObject );
				break;
			case ObjectTypes.gantry:
				break;
			case ObjectTypes.motorbike:
				break;
			case ObjectTypes.none:
				break;
			case ObjectTypes.obstacle:
				break;
			case ObjectTypes.parkingSpace:
				break;
			case ObjectTypes.patch:
				break;
			case ObjectTypes.pedestrian:
				break;
			case ObjectTypes.pole:
				break;
			case ObjectTypes.railing:
				break;
			case ObjectTypes.roadMark:
				break;
			case ObjectTypes.soundBarrier:
				break;
			case ObjectTypes.streetLamp:
				break;
			case ObjectTypes.trafficIsland:
				break;
			case ObjectTypes.trailer:
				break;
			case ObjectTypes.train:
				break;
			case ObjectTypes.tram:
				break;
			case ObjectTypes.tree:
				break;
			case ObjectTypes.van:
				break;
			case ObjectTypes.vegetation:
				break;
			case ObjectTypes.wind:
				break;


		}

	}

}

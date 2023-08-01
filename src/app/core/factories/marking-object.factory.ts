/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Crosswalk, TvRoadObject } from 'app/modules/tv-map/models/tv-road-object';
import { CatmullRomCurve3, Object3D, Vector3 } from 'three';
import { ObjectTypes } from '../../modules/tv-map/models/tv-common';
import { TvObjectMarking } from '../../modules/tv-map/models/tv-object-marking';
import { TvPosTheta } from '../../modules/tv-map/models/tv-pos-theta';

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


export class MarkingObjectFactory {

	static create ( roadObject: TvRoadObject ): Object3D {

		const object3D = new Object3D();

		roadObject.markings.forEach( marking => {

			object3D.add( this.createMarking( roadObject, marking ) );

		} );

		return object3D;
	}

	static createMarking ( roadObject: TvRoadObject, marking: TvObjectMarking ) {

		const object3D = new Object3D();

		const points: Vector3[] = [];

		roadObject.outlines.forEach( outline => {

			for ( let i = 0; i < outline.getCornerRoadCount(); i++ ) {

				const corner = outline.getCornerRoad( i );

				// const position = roadObject.road?.getPositionAt( corner.s, corner.t );

				points.push( corner.position );

			}

		} );

		const curve = new CatmullRomCurve3( points );

		return TvObjectMarking.makeFromSpline( marking, curve );

	}
}

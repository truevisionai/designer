import { Injectable } from '@angular/core';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { ObjectTypes, TvLaneSide, TvLaneType, TvSide } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadService } from 'app/services/road/road.service';
import { RoadObjectService } from '../marking-line/road-object.service';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { TvRoadObject } from 'app/modules/tv-map/models/objects/tv-road-object';

const PARKING_WIDTH = 2.5;
const PARKING_HEIGHT = 4.0;

/**

When designing a parking lot, it's essential to be aware of typical dimensions
for various elements to ensure functionality and compliance with standards.
Here are some standard dimensions:

1. **Parking Spaces**:
   - **Standard Parking Space**: Typically, 9 feet wide by 18 feet long (about 2.7 meters by 5.5 meters) is a common size for a standard parking space.
   - **Compact Spaces**: Often smaller, around 8 feet wide by 16 feet long (about 2.4 meters by 4.9 meters).
   - **Disabled Parking Spaces**: These are usually wider to accommodate wheelchair access, often around 12 feet wide (about 3.6 meters), including the access aisle.

2. **Driveways and Aisles**:
   - **One-way Traffic Aisles**: Typically range from 12 to 20 feet wide (about 3.6 to 6.1 meters), depending on whether angled parking is used.
   - **Two-way Traffic Aisles**: Usually at least 20 feet wide (about 6.1 meters), but can be wider in high-traffic areas.

3. **Angled Parking**:
   - **45-degree Parking**: Requires an aisle width of about 12 feet (about 3.6 meters).
   - **60-degree Parking**: Needs an aisle width of about 16 feet (about 4.9 meters).
   - **90-degree (Perpendicular) Parking**: Requires the widest aisles, usually around 20 feet (about 6.1 meters).

4. **Loading Zones and Drop-off Areas**:
   - **Width**: Typically around 12 feet (about 3.6 meters).
   - **Length**: Varies based on expected usage, but usually at least 20 feet long (about 6.1 meters).

5. **Walkways and Pedestrian Areas**:
   - **Sidewalks**: Minimum of 4 feet wide (about 1.2 meters), but wider in high pedestrian traffic areas.

6. **Ramps**:
   - **Width**: Should be at least as wide as traffic aisles.
   - **Slope**: Usually a maximum of 6% slope for comfort and safety.

7. **Clearance Heights**:
   - **Multi-level Parking Structures**: Minimum clearance often around 7 feet (about 2.1 meters), but higher for commercial or delivery vehicles.

8. **Turnaround Areas**:
   - **Radius**: Varies greatly depending on the intended use, but a minimum of 20 feet (about 6.1 meters) for passenger vehicles is common.

These dimensions are guidelines and can vary based on local regulations, the type of vehicles using the parking lot, and specific site conditions. It's crucial to consult local building codes and standards when designing a parking lot.

 */
@Injectable( {
	providedIn: 'root'
} )
export class ParkingRoadToolService {

	constructor (
		private roadService: RoadService,
		private controlPointFactory: ControlPointFactory,
		private roadObjectService: RoadObjectService,
	) { }

	createParkingRoad ( points: Vector3[] ) {

		const road = this.roadService.createParkingRoad();

		for ( let i = 0; i < points.length; i++ ) {

			const point = this.controlPointFactory.createSplineControlPoint( road.spline, points[ i ] );

			road.addControlPoint( point );

		}

		return road;
	}

	createLeftParkingRoad ( points: Vector3[] ) {

		const road = this.roadService.createParkingRoad();

		road.getFirstLaneSection().removeRightLanes()

		for ( let i = 0; i < points.length; i++ ) {

			const point = this.controlPointFactory.createSplineControlPoint( road.spline, points[ i ] );

			road.addControlPoint( point );

		}

		return road;
	}

	createRightParkingRoad ( points: Vector3[] ) {

		const road = this.roadService.createParkingRoad();

		road.getFirstLaneSection().removeLeftLanes()

		for ( let i = 0; i < points.length; i++ ) {

			const point = this.controlPointFactory.createSplineControlPoint( road.spline, points[ i ] );

			road.addControlPoint( point );

		}

		return road;
	}

	addRoad ( road: TvRoad ) {

		this.roadService.addRoad( road );

		road.getFirstLaneSection().getLaneArray().filter( lane => lane.type == TvLaneType.parking ).forEach( lane => {

			this.addRepeatedParkingObject( road, lane );

		} );
	}

	addRepeatedParkingObject ( road: TvRoad, lane: TvLane ) {

		const s = PARKING_WIDTH * 0.5;

		const roadObject = this.createParkingSpaceRoadObject( road, lane, s );

		const repeatLength = road.length - s;

		const distance = roadObject.width;

		roadObject.addLaneRepeat( lane, s, repeatLength, distance );

		this.roadObjectService.addRoadObject( road, roadObject );

	}

	removeRepeatedParkingObject ( road: TvRoad, lane: TvLane ) {

		road.objects.object
			.filter( roadObject => roadObject.getRepeatList().find( repeat => repeat.targetLane == lane ) )
			.forEach( roadObject => {

				this.roadObjectService.removeRoadObject( road, roadObject );

			} );

	}

	removeRoad ( object: TvRoad ) {

		this.roadService.removeRoad( object );

	}

	createParkingSpaceRoadObject ( road: TvRoad, lane: TvLane, s: number ) {

		const laneWidth = lane.getWidthValue( s );

		let t = road.getFirstLaneSection().getWidthUptoCenter( lane, s );

		if ( lane.side == TvLaneSide.RIGHT ) t *= -1;

		const roadObject = this.roadObjectService.createRoadObject( road, ObjectTypes.parkingSpace, s, t );

		roadObject.width = PARKING_WIDTH;

		roadObject.length = laneWidth;

		roadObject.height = PARKING_HEIGHT;

		roadObject.hdg = Math.PI / 2;

		const leftMarking = this.roadObjectService.createMarking();

		leftMarking.side = TvSide.LEFT;

		const rightMarking = this.roadObjectService.createMarking();

		rightMarking.side = TvSide.RIGHT;

		roadObject.addMarkingObject( leftMarking );

		roadObject.addMarkingObject( rightMarking );

		return roadObject;

	}

	createRectangularParkingLot ( start: Vector3, end: Vector3 ) {

		// Calculate width and height
		var width = Math.abs( start.x - end.x );
		var height = Math.abs( start.y - end.y );

		// Calculate center position
		var centerX = ( start.x + end.x ) / 2;
		var centerY = ( start.y + end.y ) / 2;
		var centerZ = ( start.z + end.z ) / 2;

		// Calculate points C and D
		var topLeft = new THREE.Vector3( centerX - width / 2, centerY + height / 2, centerZ );
		var bottomRight = new THREE.Vector3( centerX + width / 2, centerY - height / 2, centerZ );

		this.addRoad( this.createEntryRoad( start, topLeft ) );
		this.addRoad( this.createExitRoad( end, bottomRight ) );

		const singleRoadWidth = 5.6 + 3.6 + 3.6 + 5.6;
		const sideRoadWidth = 3.2;

		for ( let i = singleRoadWidth * 0.5; i <= height - ( singleRoadWidth * 0.5 ); i += singleRoadWidth ) {

			const start = new THREE.Vector3( ( centerX - width / 2 ) + sideRoadWidth, centerY + height / 2 - i, centerZ );
			const end = new THREE.Vector3( ( centerX + width / 2 ) - sideRoadWidth, centerY + height / 2 - i, centerZ );

			const road = this.createParkingRoad( [ start, end ] );

			this.addRoad( road );

		}

	}

	createEntryRoad ( start: THREE.Vector3, end: THREE.Vector3 ) {

		const points = [ start, end ];

		const road = this.roadService.createSingleLaneRoad( 3.2 );

		road.getFirstLaneSection().removeLeftLanes()

		for ( let i = 0; i < points.length; i++ ) {

			const point = this.controlPointFactory.createSplineControlPoint( road.spline, points[ i ] );

			road.addControlPoint( point );

		}

		return road;

	}

	createExitRoad ( start: THREE.Vector3, end: THREE.Vector3 ) {

		const points = [ start, end ];

		const road = this.roadService.createSingleLaneRoad( 3.2 );

		road.getFirstLaneSection().removeLeftLanes()

		for ( let i = 0; i < points.length; i++ ) {

			const point = this.controlPointFactory.createSplineControlPoint( road.spline, points[ i ] );

			road.addControlPoint( point );

		}

		return road;

	}

	hideBoundingBoxes () {

		this.roadService.roads.forEach( road => {

			road.getRoadObjects().forEach( roadObject => {

				this.hideBoundingBox( roadObject );

			} );

		} );

	}

	hideBoundingBox ( roadObject: TvRoadObject ) {

		// throw new Error( 'Method not implemented.' );

	}

}

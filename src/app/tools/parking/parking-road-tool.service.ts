/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { TvLaneSide, TvLaneType, TvSide } from 'app/map/models/tv-common';
import { TvLane } from 'app/map/models/tv-lane';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadService } from 'app/services/road/road.service';
import { RoadObjectService } from '../../map/road-object/road-object.service';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { TvRoadObject, TvRoadObjectType } from 'app/map/models/objects/tv-road-object';
import { TvObjectOutline } from 'app/map/models/objects/tv-object-outline';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { SplineService } from "../../services/spline/spline.service";

const PARKING_WIDTH = 2.5;
const PARKING_LENGTH = 5.5;
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
		private splineService: SplineService
	) {
	}

	createParkingRoad ( points: Vector3[] ) {

		const road = this.roadService.createParkingRoad();

		for ( let i = 0; i < points.length; i++ ) {

			const point = this.controlPointFactory.createSplineControlPoint( road.spline, points[ i ] );

			this.splineService.addPointAndUpdateSpline( road.spline, point );

		}

		return road;
	}

	createLeftParkingRoad ( points: Vector3[] ) {

		const road = this.roadService.createParkingRoad();

		road.getLaneProfile().getFirstLaneSection().removeRightLanes()

		for ( let i = 0; i < points.length; i++ ) {

			const point = this.controlPointFactory.createSplineControlPoint( road.spline, points[ i ] );

			this.splineService.addPointAndUpdateSpline( road.spline, point );

		}

		return road;
	}

	createRightParkingRoad ( points: Vector3[] ) {

		const road = this.roadService.createParkingRoad();

		road.getLaneProfile().getFirstLaneSection().removeLeftLanes()

		for ( let i = 0; i < points.length; i++ ) {

			const point = this.controlPointFactory.createSplineControlPoint( road.spline, points[ i ] );

			this.splineService.addPointAndUpdateSpline( road.spline, point );

		}

		return road;
	}

	addRoad ( road: TvRoad ): void {

		this.roadService.add( road );

		road.getLaneProfile().getFirstLaneSection().getLanes().filter( lane => lane.type == TvLaneType.parking ).forEach( lane => {

			this.addRepeatedParkingObject( road, lane );

		} );
	}

	addRepeatedParkingObject ( road: TvRoad, lane: TvLane ): void {

		const s = this.getStartPosition( road, lane.laneSection, lane ) + PARKING_WIDTH * 0.5;

		const roadObject = this.createParkingSpaceRoadObject( road, lane, s );

		const repeatLength = road.length - s;

		const distance = roadObject.width;

		roadObject.addLaneRepeat( lane, s, repeatLength, distance );

		this.roadObjectService.addRoadObject( road, roadObject );

	}

	private getStartPosition ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ): number {

		// find s where the width value is atleast 5.5 or above
		// const widthValues = lane.width.forEach(width =>>)
		let s2: number;

		const nextLaneSection = road.laneSections.find( ls => ls.s > laneSection.s );

		if ( nextLaneSection ) {

			s2 = nextLaneSection.s;

		} else {

			s2 = road.length;

		}

		for ( let s = laneSection.s; s < s2; s++ ) {

			const width = lane.getWidthValue( s );

			if ( width >= 5 ) {

				return s;

			}

		}

		return laneSection.s;
	}

	removeRepeatedParkingObject ( road: TvRoad, lane: TvLane ): void {

		road.getRoadObjects()
			.filter( roadObject => roadObject.getRepeatList().find( repeat => repeat.targetLane == lane ) )
			.forEach( roadObject => {

				this.roadObjectService.removeRoadObject( road, roadObject );

			} );

	}

	removeRoad ( object: TvRoad ): void {

		this.roadService.remove( object );

	}

	createParkingSpaceRoadObject ( road: TvRoad, lane: TvLane, s: number ) {

		const laneWidth = lane.getWidthValue( s );

		let t = road.getLaneProfile().getFirstLaneSection().getWidthUptoCenter( lane, s );

		if ( lane.isRight ) t *= -1;

		const roadObject = this.roadObjectService.createRoadObject( road, TvRoadObjectType.parkingSpace, s, t );

		roadObject.width = PARKING_WIDTH;

		roadObject.length = Math.max( laneWidth, PARKING_LENGTH );

		roadObject.height = PARKING_HEIGHT;

		roadObject.hdg = Math.PI / 2;

		const leftMarking = this.roadObjectService.createMarking();

		leftMarking.side = TvSide.LEFT;

		roadObject.addMarkingObject( leftMarking );

		// const rightMarking = this.roadObjectService.createMarking();

		// rightMarking.side = TvSide.RIGHT;

		// roadObject.addMarkingObject( rightMarking );

		// const outline = this.roadObjectService.createOutline( roadObject );
		// this.createStripedMarking( roadObject, outline );
		// this.createDiagonalMarking( roadObject, outline );
		// roadObject.outlines.push( outline );

		return roadObject;

	}

	createStripedMarking ( roadObject: TvRoadObject, outline: TvObjectOutline, stripeOffset = 0.5, gapLength = 0.3 ): void {

		const numStripes = Math.floor( roadObject.length / ( gapLength ) );

		let currentV = -roadObject.length / 2;

		for ( let i = 0; i < numStripes; i++ ) {

			const stripe = this.roadObjectService.createMarking();
			stripe.side = TvSide.NONE;
			stripe.lineLength = 0.5;

			// Each stripe is a rectangle defined by two corner points (start and end)
			const leftU = -roadObject.width / 2;
			const leftV = currentV;

			const rightU = roadObject.width / 2;
			const rightV = currentV + stripeOffset;

			const corner1 = this.roadObjectService.pushCornerLocal( outline, leftU, leftV );
			const corner2 = this.roadObjectService.pushCornerLocal( outline, rightU, rightV );

			stripe.cornerReferences.push( corner1.attr_id );
			stripe.cornerReferences.push( corner2.attr_id );

			roadObject.addMarkingObject( stripe );

			// Move the current position to the end of the gap after the stripe
			currentV += gapLength;
		}

	}

	// createDiagonalMarking ( roadObject: TvRoadObject, outline: TvObjectOutline, stripeWidth = 0.3, gap = 0.3 ) {

	// 	// NOT WORKING

	// 	const width = roadObject.width;
	// 	const height = roadObject.length;

	// 	// Calculate the number of lines based on the diagonal distance and the gap
	// 	const diagonalDistance = Math.sqrt( width * width + height * height );
	// 	const numberOfLines = Math.floor( diagonalDistance / gap );

	// 	const topLeft = new THREE.Vector3( -width / 2, height / 2, 0 );
	// 	const topRight = new THREE.Vector3( width / 2, height / 2, 0 );
	// 	const bottomLeft = new THREE.Vector3( -width / 2, -height / 2, 0 );
	// 	const bottomRight = new THREE.Vector3( width / 2, -height / 2, 0 );

	// 	// Function to interpolate between two points
	// 	function interpolate ( start: Vector3, end: Vector3, t: number ) {

	// 		return start.clone().lerp( end, t );

	// 	}

	// 	// Function to create and add a line to the scene
	// 	const addLine = ( marking, start, end ) => {

	// 		const corner1 = this.roadObjectService.pushCornerLocal( outline, start.x, start.y );
	// 		const corner2 = this.roadObjectService.pushCornerLocal( outline, end.x, end.y );

	// 		marking.cornerReferences.push( corner1.attr_id );
	// 		marking.cornerReferences.push( corner2.attr_id );

	// 	}

	// 	// Create the diagonal lines
	// 	for ( let i = 0; i <= numberOfLines; i++ ) {

	// 		const marking = this.roadObjectService.createMarking();
	// 		marking.side = TvSide.NONE;
	// 		marking.lineLength = 0.5;

	// 		const offset = gap * i;

	// 		// Calculate the offsets for both sets of lines
	// 		let startOffset = offset / height;
	// 		let endOffset = offset / width;

	// 		// Make sure we don't exceed 1 in our interpolations
	// 		if ( startOffset > 1 ) {
	// 			startOffset = 1;
	// 		}
	// 		if ( endOffset > 1 ) {
	// 			endOffset = 1;
	// 		}

	// 		// Create lines from top left to bottom right
	// 		let start = interpolate( topLeft, bottomLeft, startOffset );
	// 		let end = interpolate( topRight, bottomRight, endOffset );
	// 		addLine( marking, start, end );

	// 		// Create lines from top right to bottom left
	// 		start = interpolate( topRight, bottomLeft, startOffset );
	// 		end = interpolate( topLeft, bottomRight, endOffset );
	// 		addLine( marking, start, end );

	// 		roadObject.addMarkingObject( marking );
	// 	}
	// }

	// createDiagonalMarking ( roadObject: TvRoadObject, outline: TvObjectOutline, stripeOffset = 0.5, gapLength = 0.3 ) {

	// 	const stripeWidth = 0.3, stripeSpacing = 0.3;

	// 	/// Assuming roadObject.length and roadObject.width are the dimensions of the area to be marked
	// 	const length = roadObject.length;
	// 	const width = roadObject.width;

	// 	let currentV = -roadObject.length / 2;

	// 	// Create stripes slanting from left to right
	// 	while ( currentV < ( roadObject.length / 2 ) ) {

	// 		const marking = this.roadObjectService.createMarking();
	// 		marking.side = TvSide.NONE;
	// 		marking.lineLength = 0.5;

	// 		const left = { u: -width / 2, v: currentV };
	// 		const right = { u: width / 2, v: currentV + width };

	// 		// Push corners for the start and end of this stripe
	// 		const corner1 = this.roadObjectService.pushCornerLocal( outline, left.u, left.v );
	// 		const corner2 = this.roadObjectService.pushCornerLocal( outline, right.u, right.v );

	// 		marking.cornerReferences.push( corner1.attr_id );
	// 		marking.cornerReferences.push( corner2.attr_id );

	// 		roadObject.addMarkingObject( marking );

	// 		// Increment the currentV position by the stripe width plus spacing
	// 		currentV += stripeWidth + stripeSpacing;
	// 	}

	// 	currentV = -roadObject.length / 2;

	// 	// Create stripes slanting from right to left
	// 	while ( currentV < ( roadObject.length / 2 ) ) {

	// 		const marking = this.roadObjectService.createMarking();
	// 		marking.side = TvSide.NONE;
	// 		marking.lineLength = 0.5;

	// 		const right = { u: width / 2, v: currentV };
	// 		const left = { u: -width / 2, v: currentV + width };

	// 		// Push corners for the start and end of this stripe
	// 		const corner1 = this.roadObjectService.pushCornerLocal( outline, right.u, right.v );
	// 		const corner2 = this.roadObjectService.pushCornerLocal( outline, left.u, left.v );

	// 		marking.cornerReferences.push( corner1.attr_id );
	// 		marking.cornerReferences.push( corner2.attr_id );

	// 		roadObject.addMarkingObject( marking );

	// 		// Increment the currentV position by the stripe width plus spacing
	// 		currentV += stripeWidth + stripeSpacing;
	// 	}

	// }

	// createDiagonalMarking ( roadObject: TvRoadObject, outline: TvObjectOutline, stripeWidth = 0.3, gapLength = 0.3 ) {

	// 	// Define the number of stripes based on the road object's width and length
	// 	const numStripes = Math.ceil( ( roadObject.length + roadObject.width ) / ( stripeWidth + gapLength ) );

	// 	// Create diagonal stripes slanting from left to right
	// 	for ( let i = 0; i < numStripes; i++ ) {

	// 		// Calculate the start and end positions of each stripe
	// 		let startPos = -roadObject.length / 2 + i * ( stripeWidth + gapLength );
	// 		let endPos = startPos + roadObject.length;

	// 		// Ensure the start and end positions are within the road object's boundaries
	// 		startPos = Math.max( startPos, -roadObject.length / 2 );
	// 		endPos = Math.min( endPos, roadObject.length / 2 );

	// 		// Create the marking and add it to the road object
	// 		const marking = this.roadObjectService.createMarking();
	// 		marking.side = TvSide.NONE;

	// 		const corner1 = this.roadObjectService.pushCornerLocal( outline, -roadObject.width / 2, startPos );
	// 		const corner2 = this.roadObjectService.pushCornerLocal( outline, roadObject.width / 2, endPos );
	// 		marking.cornerReferences.push( corner1.attr_id, corner2.attr_id );

	// 		roadObject.addMarkingObject( marking );
	// 	}

	// 	// Create diagonal stripes slanting from right to left
	// 	for ( let i = 0; i < numStripes; i++ ) {

	// 		// Calculate the start and end positions of each stripe
	// 		let startPos = -roadObject.length / 2 + i * ( stripeWidth + gapLength );
	// 		let endPos = startPos + roadObject.length;

	// 		// Ensure the start and end positions are within the road object's boundaries
	// 		startPos = Math.max( startPos, -roadObject.length / 2 );
	// 		endPos = Math.min( endPos, roadObject.length / 2 );

	// 		// Create the marking and add it to the road object
	// 		const marking = this.roadObjectService.createMarking();
	// 		marking.side = TvSide.NONE;

	// 		const corner1 = this.roadObjectService.pushCornerLocal( outline, roadObject.width / 2, startPos );
	// 		const corner2 = this.roadObjectService.pushCornerLocal( outline, -roadObject.width / 2, endPos );
	// 		marking.cornerReferences.push( corner1.attr_id, corner2.attr_id );

	// 		roadObject.addMarkingObject( marking );
	// 	}
	// }

	createRectangularParkingLot ( start: Vector3, end: Vector3 ): void {

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

		road.getLaneProfile().getFirstLaneSection().removeLeftLanes()

		for ( let i = 0; i < points.length; i++ ) {

			const point = this.controlPointFactory.createSplineControlPoint( road.spline, points[ i ] );

			this.splineService.addPointAndUpdateSpline( road.spline, point );

		}

		return road;

	}

	createExitRoad ( start: THREE.Vector3, end: THREE.Vector3 ) {

		const points = [ start, end ];

		const road = this.roadService.createSingleLaneRoad( 3.2 );

		road.getLaneProfile().getFirstLaneSection().removeLeftLanes()

		for ( let i = 0; i < points.length; i++ ) {

			const point = this.controlPointFactory.createSplineControlPoint( road.spline, points[ i ] );

			this.splineService.addPointAndUpdateSpline( road.spline, point );

		}

		return road;

	}

	hideBoundingBoxes (): void {

		this.roadService.roads.forEach( road => {

			road.getRoadObjects().forEach( roadObject => {

				this.hideBoundingBox( roadObject );

			} );

		} );

	}

	hideBoundingBox ( roadObject: TvRoadObject ): void {

		//

	}

}

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { Vector3 } from 'three';
import { ToolType } from '../../models/tool-types.enum';
import { PickingHelper } from '../../services/picking-helper.service';
import { BaseTool } from '../base-tool';

export class RoadRampTool extends BaseTool {

	name: string = 'RoadRampTool';
	toolType: ToolType = ToolType.RoadRampTool;

	lane: TvLane;
	start = new Vector3;
	end = new Vector3();
	posTheta: TvPosTheta;
;

	onPointerDown ( e: PointerEventData ) {

		if ( e.button != MouseButton.LEFT ) return;

		if ( !e.point ) return;

		console.log( 'is down', this.isPointerDown );

		if ( !this.isLaneSelected( e ) ) return;

		this.lane = null;
		this.start = null;
		this.end = null;
	}

	isLaneSelected ( e: PointerEventData ): boolean {

		const interactedLane = PickingHelper.checkLaneObjectInteraction( e );

		if ( !interactedLane ) return false;

		const posTheta = new TvPosTheta();

		// getting position on track in s/t coordinates
		const result = TvMapQueries.getRoadByCoords( e.point.x, e.point.y, posTheta );

		// TvMapQueries.getRoadPosition( result.road.id, posTheta.s, posTheta.t );

		this.start = e.point.clone();
		this.posTheta = posTheta;
		this.lane = interactedLane;

		// this.makeSpline( this.start, this.lane, posTheta );

		// get the exisiting lane road mark at s and clone it
		// const roadMark = interactedLane.getRoadMarkAt( posTheta.s ).clone( posTheta.s );
	}

	// makeRampRoad(A: Vector3, B: Vector3, posTheta: TvPosTheta) {
	//     const direction = posTheta.toDirectionVector();
	//     const normalizedDirection = direction.clone().normalize();

	//     const upVector = new Vector3(0, 0, 1);
	//     const perpendicular = normalizedDirection.clone().cross(upVector);

	//     const midPoint = A.clone().add(B).multiplyScalar(0.5);

	//     const distanceAB = A.distanceTo(B);
	//     const offsetFactor = 0.25 * distanceAB;

	//     const v2 = A.clone().add(normalizedDirection.clone().multiplyScalar(offsetFactor));
	//     const v3 = midPoint.clone().add(perpendicular.clone().multiplyScalar(offsetFactor));

	//     const road = this.map.addDefaultRoad();

	//     road.addControlPointAt(A);
	//     road.addControlPointAt(v2);
	//     road.addControlPointAt(v3);
	//     road.addControlPointAt(B);

	//     console.log("road", [A, v2, v3, B]);

	//     road.updateGeometryFromSpline();
	// }

	makeRampRoad ( A: Vector3, B: Vector3, posTheta: TvPosTheta ) {

		let v2, v3;

		[ A, v2, v3, B ] = this.makeRampRoadPoints( A, B, posTheta );

		const newLane = this.lane.cloneAtS( -1, posTheta.s );

		const road = this.map.addRampRoad( newLane );

		road.addControlPointAt( A );
		road.addControlPointAt( v2 );
		road.addControlPointAt( v3 );
		road.addControlPointAt( B );

		road.updateGeometryFromSpline();

		TvMapBuilder.rebuildRoad( road );
	}


	makeRampRoadPoints ( A: Vector3, B: Vector3, posTheta: TvPosTheta ): Vector3[] {

		const direction = posTheta.toDirectionVector();
		const normalizedDirection = direction.clone().normalize();

		const upVector = new Vector3( 0, 0, 1 );
		const perpendicular = normalizedDirection.clone().cross( upVector );

		const distanceAB = A.distanceTo( B );

		const v2 = A.clone().add( normalizedDirection.clone().multiplyScalar( distanceAB / 3 ) );
		const v3 = B.clone().add( perpendicular.clone().multiplyScalar( -distanceAB / 3 ) );

		return [ A, v2, v3, B ];
	}

	// makeRampRoad ( A: Vector3, B: Vector3, posTheta: TvPosTheta ) {

	// 	const direction = posTheta.toDirectionVector();
	// 	const normalizedDirection = direction.clone().normalize();

	// 	const upVector = new Vector3( 0, 0, 1 );
	// 	const perpendicular = normalizedDirection.clone().cross( upVector );

	// 	const distanceAB = A.distanceTo( B );

	// 	function calculateBezier ( t, p0, p1, p2, p3 ) {
	// 		const oneMinusT = 1 - t;
	// 		return p0.clone().multiplyScalar( Math.pow( oneMinusT, 3 ) )
	// 			.add( p1.clone().multiplyScalar( 3 * t * Math.pow( oneMinusT, 2 ) ) )
	// 			.add( p2.clone().multiplyScalar( 3 * Math.pow( t, 2 ) * oneMinusT ) )
	// 			.add( p3.clone().multiplyScalar( Math.pow( t, 3 ) ) );
	// 	}

	// 	const road = this.map.addDefaultRoad();

	// 	const controlPoint1 = A.clone().add( normalizedDirection.clone().multiplyScalar( distanceAB / 3 ) );
	// 	const controlPoint2 = B.clone().add( perpendicular.clone().multiplyScalar( -distanceAB / 3 ) );

	// 	const v2 = calculateBezier( 1 / 3, A, controlPoint1, controlPoint2, B );
	// 	const v3 = calculateBezier( 2 / 3, A, controlPoint1, controlPoint2, B );

	// 	road.addControlPointAt( A );
	// 	road.addControlPointAt( v2 );
	// 	road.addControlPointAt( v3 );
	// 	road.addControlPointAt( B );

	// 	console.log( "road", [ A, v2, v3, B ] );

	// 	road.updateGeometryFromSpline();
	// }


	onPointerMoved ( e: PointerEventData ) {

		if ( e.button != MouseButton.LEFT ) return;

		if ( this.lane && this.start ) {

			this.end = e.point.clone();

		}

	}

	onPointerUp ( e: PointerEventData ) {

		if ( e.button != MouseButton.LEFT ) return;

		// console.log( 'is down', this.isPointerDown, this.pointerDownAt, 'up at', e.point );

		if ( this.lane && this.start ) {

			// console.log( 'create ramp', this.lane, this.start, this.end );

			// SceneService.add( AnyControlPoint.create( '', this.start ) );
			// SceneService.add( AnyControlPoint.create( '', this.end ) );

			const start = TvMapQueries.getLaneStartPosition( this.lane.roadId, this.lane.id, this.posTheta.s, 0 );

			this.makeRampRoad( start, this.end, this.posTheta );

			this.start = null;
			this.lane = null;
			this.end = null;

		}

	}

}

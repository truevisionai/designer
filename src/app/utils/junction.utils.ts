import { IntersectionGroup } from "app/managers/Intersection-group";
import { TvJointBoundary, TvJunctionSegmentBoundary, TvLaneBoundary } from "app/map/junction-boundary/tv-junction-boundary";
import { TvJunctionBoundaryBuilder } from "app/map/junction-boundary/tv-junction-boundary.builder";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvContactPoint } from "app/map/models/tv-common";
import { TvRoad } from "app/map/models/tv-road.model";
import { Vector3 } from "three";
import { Maths } from "./maths";

export class JunctionUtils {

	static generateJunctionHash ( junction: TvJunction ) {

		const splineIds = junction.getIncomingSplines().map( spline => spline.uuid ).sort().join( ',' );

		const hash = `${ splineIds }`;

		return hash;
	}

	static generateGroupHash ( group: IntersectionGroup ) {

		const spline = group.getSplines().map( spline => spline.uuid ).sort().join( ',' );

		const hash = `${ spline }`;

		return hash;
	}

	static convetToPositions ( segment: TvJunctionSegmentBoundary ): Vector3[] {

		if ( segment instanceof TvLaneBoundary ) {

			return this.convertLaneToPositions( segment );

		} else if ( segment instanceof TvJointBoundary ) {

			return this.convertJointToPositions( segment );

		}

		throw new Error( 'Invalid segment type' );
	}

	static convertJointToPositions ( joint: TvJointBoundary ): Vector3[] {

		const posTheta = joint.road.getPosThetaByContact( joint.contactPoint );
		const roadWidth = joint.road.getRoadWidthAt( posTheta.s );
		const t = roadWidth.leftSideWidth - roadWidth.rightSideWidth;

		// return only 2 points for joint boundary
		const start = joint.road.getLaneEndPosition( joint.jointLaneStart, posTheta.s ).toVector3();
		const mid = joint.road.getPosThetaAt( posTheta.s, t * 0.5 ).toVector3();
		const end = joint.road.getLaneEndPosition( joint.jointLaneEnd, posTheta.s ).toVector3();
		return [ start, mid, end ];

		// const points: Vector3[] = []

		// for ( let t = 0; t < roadWidth.leftSideWidth; t++ ) {
		//
		// 	const point = joint.road.getPosThetaAt( posTheta.s, roadWidth.leftSideWidth - t ).toVector3();
		//
		// 	points.push( point );
		//
		// }
		//
		// for ( let t = 0; t < roadWidth.rightSideWidth; t++ ) {
		//
		// 	const point = joint.road.getPosThetaAt( posTheta.s, -1 * t ).toVector3();
		//
		// 	points.push( point );
		//
		// }

		// return points;
	}

	static convertLaneToPositions ( lane: TvLaneBoundary ): Vector3[] {

		const positions: Vector3[] = [];

		const start = this.findPosition( lane.road, lane.sStart );

		const end = this.findPosition( lane.road, lane.sEnd );

		// push first point
		positions.push( lane.road.getLaneEndPosition( lane.boundaryLane, start.s + Maths.Epsilon ).toVector3() );

		for ( let s = start.s; s <= end.s; s += 1 ) {

			const posTheta = lane.road.getPosThetaAt( s );

			const position = lane.road.getLaneEndPosition( lane.boundaryLane, posTheta.s ).toVector3();

			positions.push( position );

		}

		// push last point
		positions.push( lane.road.getLaneEndPosition( lane.boundaryLane, end.s - Maths.Epsilon ).toVector3() );

		return positions;


	}

	static findPosition ( road: TvRoad, value: number | TvContactPoint ) {

		if ( typeof value == 'number' ) {

			return road.getPosThetaAt( value );

		} else if ( value == TvContactPoint.START ) {

			return road.getPosThetaAt( 0 );

		} else if ( value == TvContactPoint.END ) {

			return road.getPosThetaAt( road.length );

		}

	}


}

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadNode } from 'app/objects/road/road-node';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { Maths } from 'app/utils/maths';
import { Vector2, Vector3 } from 'three';

export class JoinNode {

	private firstPosTheta: TvPosTheta;
	private secondPosTheta: TvPosTheta;

	private firstPosition: Vector3;
	private secondPosition: Vector3;

	constructor ( public firstNode: RoadNode, public secondNode: RoadNode ) {

		this.firstPosTheta = firstNode.getPosition();
		this.secondPosTheta = secondNode.getPosition();

		this.firstPosition = this.firstPosTheta.toVector3();
		this.secondPosition = this.secondPosTheta.toVector3();

	}

	join (): void {

		// first node position/direction
		// second node position/direction

		this.checkIntersection( this.firstNode.getPosition(), this.secondNode.getPosition() );

		this.checkIntersectionInSameDirection( this.firstNode.getPosition(), this.secondNode.getPosition() );

		const slopeA = this.headingToSlope( this.firstPosTheta.hdg );
		const slopeB = this.headingToSlope( this.secondPosTheta.hdg );

		const yInterceptA = this.calculateYIntercept( this.firstPosition.x, this.firstPosition.y, slopeA );
		const yInterceptB = this.calculateYIntercept( this.secondPosition.x, this.secondPosition.y, slopeB );

		const intersectionPoint = this.calculateIntersection( slopeA, slopeB, yInterceptA, yInterceptB );

		const firstDistance = this.firstPosition.distanceTo( intersectionPoint );
		const secondDistance = this.secondPosition.distanceTo( intersectionPoint );

		if ( intersectionPoint ) {

			Debug.log( 'The roads will intersect at:', intersectionPoint );

		}

		Debug.log( 'firstDistance', firstDistance );
		Debug.log( 'secondDistance', secondDistance );

	}

	private headingToSlope ( hdg: any ): number {
		return Math.tan( hdg );
	}

	private calculateYIntercept ( x: any, y: any, slope: any ): number {
		return y - slope * x;
	}

	private calculateIntersection ( slopeA: any, slopeB: any, yInterceptA: any, yInterceptB: any ): Vector3 {
		if ( slopeA === slopeB ) {
			return null; // The lines are parallel and do not intersect
		}

		const x = ( yInterceptB - yInterceptA ) / ( slopeA - slopeB );
		const y = slopeA * x + yInterceptA;

		return new Vector3( x, y, 0 );
	}

	private checkIntersection ( a: TvPosTheta, b: TvPosTheta ): void {

		const directionVectorA = {
			x: Math.cos( a.hdg ),
			y: Math.sin( a.hdg ),
		};

		const directionVectorB = {
			x: Math.cos( b.hdg ),
			y: Math.sin( b.hdg ),
		};

		const crossProduct = directionVectorA.x * directionVectorB.y - directionVectorA.y * directionVectorB.x;

		const tolerance = 1e-6; // Adjust this value depending on the required precision
		const roadsAreParallel = Math.abs( crossProduct ) < tolerance;

		if ( roadsAreParallel ) {

			Debug.log( 'The roads are parallel and will not intersect.' );

		} else {

			Debug.log( 'The roads will intersect at some point.' );

		}
	}

	private checkIntersectionInSameDirection ( a: TvPosTheta, b: TvPosTheta ): void {

		// function isIntersectionInDirection ( intersection, startPoint: TvPosTheta, directionVector ) {
		// 	const deltaX = intersection.x - startPoint.x;
		// 	const deltaY = intersection.y - startPoint.y;

		// 	return (
		// 		( directionVector.x >= 0 ? deltaX >= 0 : deltaX <= 0 ) &&
		// 		( directionVector.y >= 0 ? deltaY >= 0 : deltaY <= 0 )
		// 	);
		// }

		function isIntersectionInDirection ( intersection: Vector2, startPoint: TvPosTheta, directionVector: any ): any {

			return startPoint.isPointOnLine( intersection );


			// const deltaX = intersection.x - startPoint.x;
			// const deltaY = intersection.y - startPoint.y;

			// const dotProduct = deltaX * directionVector.x + deltaY * directionVector.y;

			// // If the dot product is positive, the intersection point is in the correct direction
			// return dotProduct > 0;
		}

		const directionVectorA = {
			x: Math.cos( a.hdg ),
			y: Math.sin( a.hdg ),
		};

		const directionVectorB = {
			x: Math.cos( b.hdg ),
			y: Math.sin( b.hdg ),
		};

		const slopeA = directionVectorA.y / directionVectorA.x;
		const slopeB = directionVectorB.y / directionVectorB.x;

		const yInterceptA = a.y - slopeA * a.x;
		const yInterceptB = b.y - slopeB * b.x;

		const intersectionX = ( yInterceptB - yInterceptA ) / ( slopeA - slopeB );
		const intersectionY = slopeA * intersectionX + yInterceptA;

		const intersectionPoint = new Vector3( intersectionX, intersectionY, 0 );

		const intersectionInDirectionA = Maths.isPointOnLine( a.toVector3(), a.moveForward( 1000 ).toVector3(), intersectionPoint );
		const intersectionInDirectionB = Maths.isPointOnLine( b.toVector3(), b.moveForward( 1000 ).toVector3(), intersectionPoint );

		if ( intersectionInDirectionA && intersectionInDirectionB ) {
			Debug.log( 'The intersection point follows the direction of both points:', intersectionPoint );
		} else {
			Debug.log( 'The intersection point does not follow the direction of one or both points.' );
		}
	}
}

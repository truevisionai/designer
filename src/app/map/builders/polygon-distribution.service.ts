/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from "app/core/maths"

import earcut from 'earcut';

export class PolygonDistributionService {

	static distributePoints ( points: Vector3[], density: number ): Vector3[] {

		if ( points.length < 3 ) {
			console.error( 'At least 3 points are required to form a polygon.' );
			return [];
		}

		if ( density < 0 || density > 1 ) {
			console.error( 'Density must be between 0 and 1.' );
			return [];
		}

		const flattenedPoints: number[] = [];
		for ( const point of points ) {
			flattenedPoints.push( point.x, point.y );
		}
		const triangles = earcut( flattenedPoints );

		const totalArea = this.computePolygonArea( points );
		const desiredTotalPoints = Math.floor( totalArea * density * 0.1 );
		const resultPoints: Vector3[] = [];

		for ( let i = 0; i < triangles.length; i += 3 ) {

			const a = new Vector3( flattenedPoints[ triangles[ i ] * 2 ], flattenedPoints[ triangles[ i ] * 2 + 1 ], 0 );
			const b = new Vector3( flattenedPoints[ triangles[ i + 1 ] * 2 ], flattenedPoints[ triangles[ i + 1 ] * 2 + 1 ], 0 );
			const c = new Vector3( flattenedPoints[ triangles[ i + 2 ] * 2 ], flattenedPoints[ triangles[ i + 2 ] * 2 + 1 ], 0 );

			const triangleArea = this.computeTriangleArea( a, b, c );
			const pointsInThisTriangle = Math.floor( ( triangleArea / totalArea ) * desiredTotalPoints );

			for ( let j = 0; j < pointsInThisTriangle; j++ ) {

				const point = this.randomPointInTriangle( a, b, c );

				resultPoints.push( point );

			}

		}

		return resultPoints;
	}

	private static randomPointInTriangle ( a: Vector3, b: Vector3, c: Vector3 ): Vector3 {
		// Barycentric coordinates
		let u = Math.random();
		let v = Math.random();

		if ( u + v > 1 ) {
			u = 1 - u;
			v = 1 - v;
		}

		const w = 1 - u - v;

		return new Vector3(
			a.x * u + b.x * v + c.x * w,
			a.y * u + b.y * v + c.y * w,
			a.z * u + b.z * v + c.z * w
		);
	}

	private static computeTriangleArea ( a: Vector3, b: Vector3, c: Vector3 ): number {
		// Using the cross product to find the area of the triangle
		const ab = new Vector3().subVectors( b, a );
		const ac = new Vector3().subVectors( c, a );
		const cross = new Vector3().crossVectors( ab, ac );
		return cross.length() * 0.5;
	}

	private static computePolygonArea ( points: Vector3[] ): number {
		// Assuming the polygon is convex and using the shoelace formula
		let sum = 0;
		for ( let i = 0; i < points.length; i++ ) {
			const j = ( i + 1 ) % points.length;
			sum += points[ i ].x * points[ j ].y - points[ j ].x * points[ i ].y;
		}
		return Math.abs( sum / 2.0 );
	}
}

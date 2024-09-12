import { Vector3 } from "three";

export abstract class LineUtils {

	static findCenter ( points: Vector3[] ): Vector3 {

		const center = new Vector3();

		for ( let i = 0; i < points.length; i++ ) {

			center.add( points[ i ] );

		}

		center.divideScalar( points.length );

		return center;

	}

	static findMinDistance ( point: Vector3, linePoints: Vector3[] ): number {

		let minDistance = Infinity;

		for ( let i = 0; i < linePoints.length - 1; i++ ) {

			const distance = linePoints[ i ].distanceTo( point );

			if ( distance < minDistance ) {

				minDistance = distance;

			}

		}

		return minDistance;

	}

	static distanceToLine ( point: Vector3, a: Vector3, b: Vector3 ): number {

		const v1 = new Vector3();
		const v2 = new Vector3();
		const v3 = new Vector3();

		v1.subVectors( b, a );
		v2.subVectors( point, a );

		v3.crossVectors( v1, v2 );

		return v3.length() / v1.length();

	}

}

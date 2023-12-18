import { Injectable } from '@angular/core';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Vector3 } from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class IntersectionService {

	constructor () { }

	detectIntersections ( roadA: TvRoad, roadB: TvRoad, stepSize = 1 ): Vector3 | null {

		if ( roadA.id == roadB.id ) return;

		if ( !this.intersectsBox( roadA, roadB ) ) return;

		const pointsA = roadA.getReferenceLinePoints( stepSize );
		const pointsB = roadB.getReferenceLinePoints( stepSize );

		for ( let i = 0; i < pointsA.length - 1; i++ ) {

			for ( let j = 0; j < pointsB.length - 1; j++ ) {

				const a = pointsA[ i ].position;
				const b = pointsA[ i + 1 ].position;
				const c = pointsB[ j ].position;
				const d = pointsB[ j + 1 ].position;

				const distance = a.distanceTo( c );

				if ( distance < stepSize ) {

					return this.lineIntersection( a, b, c, d );

				}

			}

		}

	}

	private intersectsBox ( roadA: TvRoad, roadB: TvRoad ): boolean {

		if ( !roadA.boundingBox ) roadA.computeBoundingBox();
		if ( !roadB.boundingBox ) roadB.computeBoundingBox();

		const roadABox = roadA.boundingBox;
		const roadBBox = roadB.boundingBox;

		// return true if we box is not generated
		if ( !roadABox || !roadBBox ) return true;

		const boxIntersection = roadABox.intersectsBox( roadBBox );

		if ( boxIntersection ) console.log( roadA.id, roadB.id, boxIntersection, roadABox, roadBBox );

		return boxIntersection;

	}

	private lineIntersection ( a: Vector3, b: Vector3, c: Vector3, d: Vector3 ): Vector3 | null {

		// Direction vectors for the lines
		const dir1 = b.clone().sub( a );
		const dir2 = d.clone().sub( c );

		// Vector from a to c
		const ac = c.clone().sub( a );

		// Check if lines are parallel (cross product is zero)
		const crossDir1Dir2 = dir1.clone().cross( dir2 );
		if ( crossDir1Dir2.lengthSq() === 0 ) return null; // Lines are parallel

		// Compute the parameters t and s
		const t = ( ac.clone().cross( dir2 ).dot( crossDir1Dir2 ) ) / crossDir1Dir2.lengthSq();
		const s = ( ac.clone().cross( dir1 ).dot( crossDir1Dir2 ) ) / crossDir1Dir2.lengthSq();

		// Compute the closest points on the lines
		const closestPtOnLine1 = a.clone().add( dir1.multiplyScalar( t ) );
		const closestPtOnLine2 = c.clone().add( dir2.multiplyScalar( s ) );

		// Check if the closest points are the same (within a small tolerance)
		if ( closestPtOnLine1.distanceTo( closestPtOnLine2 ) < 1e-6 ) {
			return closestPtOnLine1; // Intersection point
		}

		return null; // Lines do not intersect

	}
}

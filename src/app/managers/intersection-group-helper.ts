/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SplineIntersection } from "app/services/junction/spline-intersection";
import { IntersectionGroup } from "./Intersection-group";
import { Log } from "app/core/utils/log";



export class IntersectionGroupHelper {

	private processed: Set<SplineIntersection> = new Set();

	constructor (
		private intersections: SplineIntersection[],
		private thresholdDistance = 10
	) {
	}

	getGroups (): IntersectionGroup[] {

		const groups = [];

		for ( const intersection of this.intersections ) {

			if ( this.processed.has( intersection ) ) continue;

			const group = new IntersectionGroup( intersection );

			const otherCloseIntersections = this.getCloseIntersections( group );

			group.addSplineIntersection( otherCloseIntersections );

			otherCloseIntersections.forEach( i => this.processed.add( i ) );

			this.processed.add( intersection );

			groups.push( group );

		}

		return groups;

	}

	private getCloseIntersections ( group: IntersectionGroup ): SplineIntersection[] {

		const closeIntersections = [];

		for ( const intersection of this.intersections ) {

			if ( this.isProcessed( intersection, group ) ) continue;

			const distance = intersection.position.distanceTo( group.getRepresentativePosition() );

			if ( distance <= this.thresholdDistance ) {

				closeIntersections.push( intersection );

			}

		}

		return closeIntersections;
	}

	private isProcessed ( intersection: SplineIntersection, group: IntersectionGroup ): boolean {

		if ( group.hasIntersection( intersection ) ) return true;

		if ( this.processed.has( intersection ) ) return true;

		return false;

	}

}


// mergeGroups ( groups: IntersectionGroup[] ) {

// 	for ( const group of groups ) {

// 		this.mergeGroup( group );

// 	}

// }

// mergeGroup ( group: IntersectionGroup ) {

// 	const splines = group.getSplines();

// 	for ( const spline of splines ) {

// 		spline.segmentMap.forEach( segment => {

// 			if ( segment instanceof TvJunction ) {

// 				// this.junctionGeometryService.updateBoundingBox( segment );

// 				// const boundingBox = segment.depBoundingBox || this.junctionService.computeBoundingBox( segment );

// 				const groupPosition = new Vector2( group.centroid.x, group.centroid.y );

// 				const distance = segment.distanceToPoint( groupPosition );

// 				if ( distance < 10 ) {

// 					if ( this.debug ) Log.debug( 'Merging Junction Into Group', segment.toString() );

// 					const incomingSplines = segment.getIncomingSplines();

// 					incomingSplines.forEach( incomingSpline => {

// 						const i = new SplineIntersection( incomingSpline, spline, group.getRepresentativePosition() );

// 						group.addSplineIntersection( i );

// 					} );

// 					this.removeJunction( segment );

// 				}

// 			}

// 		} );

// 	}
// }


export function createGroupsFromIntersections ( intersections: SplineIntersection[], thresholdDistance: number = 10 ): IntersectionGroup[] {

	const groups: IntersectionGroup[] = [];

	const processed: boolean[] = new Array( intersections.length ).fill( false );

	for ( let i = 0; i < intersections.length; i++ ) {

		const intersection = intersections[ i ];

		if ( processed[ i ] ) continue; // Skip already processed intersections

		// Create a new group with the current intersection
		const group = new IntersectionGroup( intersection );

		processed[ i ] = true;

		// Compare with other intersections to find close ones
		for ( let j = 0; j < intersections.length; j++ ) {

			const otherIntersection = intersections[ j ];

			if ( i !== j && !processed[ j ] ) {

				// const distance = intersection.position.distanceTo( otherIntersection.position );

				// if ( distance <= thresholdDistance ) {

				// 	group.addSplineIntersection( otherIntersection );

				// 	processed[ j ] = true;

				// }

			}

		}

		// // TODO: check if need need this
		// const nearest = this.findNearestJunctionForGroup( group );

		// if ( nearest ) {

		// 	this.removeJunction( nearest );

		// }

		group.centroid = group.getRepresentativePosition();

		group.reComputeJunctionOffsets();

		groups.push( group );

	}

	for ( let i = 0; i < groups.length; i++ ) {

		const group = groups[ i ];

		for ( let j = i + 1; j < groups.length; j++ ) {

			const otherGroup = groups[ j ];

			const distance = group.centroid.distanceTo( otherGroup.centroid );

			const intersect = group.area.intersectsBox( otherGroup.area );

			if ( intersect || distance < thresholdDistance ) {

				Log.warn( 'Merging Groups', group.toString(), otherGroup.toString() );

				group.merge( otherGroup );

				group.centroid = group.getRepresentativePosition();

				groups.splice( j, 1 );

				group.reComputeJunctionOffsets();

				j--;

			}

		}

	}

	return groups;
}

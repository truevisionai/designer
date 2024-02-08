/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { IntersectionService, SplineIntersection } from "app/services/junction/intersection.service";
import { TvRoadCoord } from "app/map/models/TvRoadCoord";
import { SplineBuilder } from "app/services/spline/spline.builder";
import { JunctionManager } from "./junction-manager";
import { JunctionFactory } from "app/factories/junction.factory";
import { MapService } from "app/services/map/map.service";
import { Vector3 } from "three";
import { JunctionService } from "../services/junction/junction.service";
import { SplineSegment } from "../core/shapes/spline-segment";
import { TvRoad } from "../map/models/tv-road.model";
import { SplineSegmentService } from "../services/spline/spline-segment.service";
import { TvRoadLinkChildType } from "../map/models/tv-road-link-child";
import { RoadService } from "../services/road/road.service";
import { TvContactPoint } from "../map/models/tv-common";
import { RoadLinkService } from "../services/road/road-link.service";

class IntersectionGroup {

	intersections: Vector3[] = []; // Positions of intersections in this group

	splines: Set<AbstractSpline> = new Set(); // Unique splines involved in the intersections of this group

	constructor ( initialIntersection: Vector3, initialSplines: AbstractSpline[] ) {
		this.addIntersection( initialIntersection, initialSplines );
	}

	addIntersection ( intersection: Vector3, splines: AbstractSpline[] ) {
		this.intersections.push( intersection );
		splines.forEach( spline => this.splines.add( spline ) );
	}

	// Calculates the centroid of the intersections as the representative position
	getRepresentativePosition (): Vector3 {
		let x = 0, y = 0, z = 0;
		this.intersections.forEach( intersection => {
			x += intersection.x;
			y += intersection.y;
			z += intersection.z;
		} );
		const count = this.intersections.length;
		return new Vector3( x / count, y / count, z / count );
	}

}

@Injectable( {
	providedIn: 'root'
} )
export class IntersectionManager {

	constructor (
		private mapService: MapService,
		private intersectionService: IntersectionService,
		private junctionManager: JunctionManager,
		private splineBuilder: SplineBuilder,
		private junctionFactory: JunctionFactory,
		private junctionService: JunctionService,
		private segmentService: SplineSegmentService,
		private roadService: RoadService,
		private linkService: RoadLinkService,
	) {
	}

	updateIntersections ( spline: AbstractSpline ) {

		if ( spline.isConnectingRoad() ) return;

		// when a spline is updated
		// we first check if it has junctions or not
		const junctions = spline.getJunctions();

		this.removeJunctions( junctions );

		const intersections = this.intersectionService.getSplineIntersections( spline );

		const groups = this.groupIntersections( intersections, 10 );

		//for ( let i = 0; i < intersections.length; i++ ) {
		//
		//	const item = intersections[ i ];
		//
		//	const junction = this.intersectionService.createJunction(
		//		item.spline,
		//		item.otherSpline,
		//		item.position
		//	);
		//
		//	if ( !junction ) {
		//		console.error( 'Could not create junction', spline, item );
		//		// console.trace( 'Could not create junction', spline, item );
		//		return;
		//	}
		//
		//	this.intersectionService.postProcessJunction( junction );
		//
		//	this.mapService.map.addJunctionInstance( junction );
		//
		//	this.junctionManager.addJunction( junction );
		//
		//	this.splineBuilder.buildSpline( item.spline );
		//
		//	this.splineBuilder.buildSpline( item.otherSpline );
		//
		//}

		this.processGroups( groups );

	}

	removeJunctions ( junctions: TvJunction[] ) {

		for ( let i = 0; i < junctions.length; i++ ) {

			this.removeJunction( junctions[ i ] );

		}

	}

	removeJunction ( junction: TvJunction ) {

		this.junctionManager.removeJunction( junction );

		this.mapService.map.removeJunction( junction );

	}

	createJunctionFromCoords ( coords: TvRoadCoord[] ): TvJunction {

		const junction = this.junctionFactory.createJunction();

		for ( let i = 0; i < coords.length; i++ ) {

			const coordA = coords[ i ];

			for ( let j = i + 1; j < coords.length; j++ ) {

				const coordB = coords[ j ];

				// roads should be different
				if ( coordA.road === coordB.road ) continue;

				this.intersectionService.addConnections( junction, coordA, coordB );

			}

		}

		this.intersectionService.postProcessJunction( junction );

		return junction;
	}

	groupIntersections ( intersections: SplineIntersection[], thresholdDistance: number ): IntersectionGroup[] {

		const groups: IntersectionGroup[] = [];

		const processed: boolean[] = new Array( intersections.length ).fill( false );

		for ( let i = 0; i < intersections.length; i++ ) {

			const intersection = intersections[ i ];

			if ( processed[ i ] ) continue; // Skip already processed intersections

			// Create a new group with the current intersection
			const group = new IntersectionGroup( intersection.position, [ intersection.spline, intersection.otherSpline ] );

			processed[ i ] = true;

			// Compare with other intersections to find close ones
			for ( let j = 0; j < intersections.length; j++ ) {

				const otherIntersection = intersections[ j ];

				if ( i !== j && !processed[ j ] ) {

					const distance = intersection.position.distanceTo( otherIntersection.position );

					if ( distance <= thresholdDistance ) {

						group.addIntersection( otherIntersection.position, [ otherIntersection.spline, otherIntersection.otherSpline ] );

						processed[ j ] = true;

					}

				}

			}

			groups.push( group );

		}

		return groups;
	}

	private processGroups = ( groups: IntersectionGroup[] ) => {

		for ( let i = 0; i < groups.length; i++ ) {

			this.processGroup( groups[ i ] );

		}

	}

	private processGroup ( intersectionGroup: IntersectionGroup ) {

		const junction = this.junctionFactory.createFromPosition( intersectionGroup.getRepresentativePosition() );

		const splines = Array.from( intersectionGroup.splines );

		const coords: TvRoadCoord[] = [];

		const junctionWidth = 12;

		for ( let i = 0; i < splines.length; i++ ) {

			const spline = splines[ i ];

			const splineCoords = this.getRoadCoords( spline, junction, intersectionGroup.getRepresentativePosition() );

			for ( let j = 0; j < splineCoords.length; j++ ) {

				coords.push( splineCoords[ j ] );

			}

		}

		for ( let i = 0; i < coords.length; i++ ) {

			const coordA = coords[ i ];

			for ( let j = i + 1; j < coords.length; j++ ) {

				const coordB = coords[ j ];

				// roads should be different
				if ( coordA.road === coordB.road ) continue;

				this.intersectionService.addConnections( junction, coordA, coordB );

			}

		}

		this.intersectionService.postProcessJunction( junction );

		this.junctionService.addJunction( junction );

	}

	private getRoadCoords ( spline: AbstractSpline, junction: TvJunction, point: Vector3 ): TvRoadCoord[] {

		const junctionWidth = 12;

		const coords = [];

		const splineCoord = spline.getCoordAt( point );

		const segment = spline.getSegmentAt( splineCoord.s );

		if ( !segment || !segment.isRoad ) {

			junction.getIncomingRoads().forEach( road => coords.push( road.getRoadCoordByContact( TvContactPoint.END ) ) );

			junction.getOutgoingRoads().forEach( road => coords.push( road.getRoadCoordByContact( TvContactPoint.START ) ) );

			return coords;
		}

		const sStart = splineCoord.s - junctionWidth;
		const sEnd = splineCoord.s + junctionWidth;

		const startSegment = spline.getSegmentAt( sStart );
		const endSegment = spline.getSegmentAt( sEnd );

		const differentRoads = startSegment && endSegment ? startSegment.getInstance<TvRoad>() != endSegment.getInstance<TvRoad>() : false;

		if ( differentRoads ) {

			// coord is at the junction or joining of two roads
			// add junction segment on spline and update both roads

		} else if ( sStart <= junctionWidth || sEnd > spline.getLength() ) {

			// coord is at the start/end of the road
			// add junction segment on spline and update road
			const junctionWidth = 12;

			const atStart = sStart <= 0;
			const atEnd = sEnd >= spline.getLength();

			if ( atEnd ) {

				const road = endSegment.getInstance<TvRoad>();

				const sStartJunction = splineCoord.s - junctionWidth;

				this.segmentService.addJunctionSegment( spline, sStartJunction, junction );

				this.roadService.update( road );

				road.setSuccessor( TvRoadLinkChildType.junction, junction );

				coords.push( road.getRoadCoordByContact( TvContactPoint.END ) );

			} else if ( atStart ) {

				const segment = spline.getSegmentAt( 0 );

				const road = segment.getInstance<TvRoad>();

				const sEndJunction = junctionWidth;

				segment.setStart( sEndJunction );

				this.segmentService.addJunctionSegment( spline, 0, junction );

				road.setPredecessor( TvRoadLinkChildType.junction, junction );

				this.roadService.update( road );

				coords.push( road.getRoadCoordByContact( TvContactPoint.START ) );

			}

		} else {

			// coord is in the middle of the road
			// add junction segment on spline and add new road
			const oldRoad = startSegment.getInstance<TvRoad>();

			this.segmentService.addJunctionSegment( spline, sStart, junction );

			const newRoad = this.roadService.clone( startSegment.getInstance<TvRoad>(), sStart );

			newRoad.sStart = sEnd;

			this.segmentService.addRoadSegmentNew( spline, sEnd, newRoad );

			newRoad.setPredecessor( TvRoadLinkChildType.junction, junction );

			oldRoad.setSuccessor( TvRoadLinkChildType.junction, junction );

			this.linkService.updateSuccessorRelationWhileCut( newRoad, newRoad.successor, oldRoad );

			this.roadService.add( newRoad );

			this.roadService.update( oldRoad );

			coords.push( oldRoad.getRoadCoordByContact( TvContactPoint.END ) );

			coords.push( newRoad.getRoadCoordByContact( TvContactPoint.START ) );

		}

		return coords;
	}

	private addSplineSegment ( spline: AbstractSpline, s: number, segment: SplineSegment ) {

		//

	}
}

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoad } from "app/map/models/tv-road.model";
import { MapService } from "app/services/map/map.service";
import { RoadLinkService } from "app/services/road/road-link.service";
import { SplineBuilder } from "app/services/spline/spline.builder";
import { RoadManager } from "./road/road-manager";
import { RoadService } from "app/services/road/road.service";
import { JunctionFactory } from "app/factories/junction.factory";
import { SplineSegmentService } from "../services/spline/spline-segment.service";
import { AbstractSpline } from "../core/shapes/abstract-spline";
import { SplineIntersection } from 'app/services/junction/spline-intersection';
import { IntersectionGroup } from "./Intersection-group";
import { TvRoadCoord } from "../map/models/TvRoadCoord";
import { GeometryUtils } from "../services/surface/surface-geometry.builder";
import { TvContactPoint } from "../map/models/tv-common";
import { TvRoadLinkChildType } from "../map/models/tv-road-link-child";
import { JunctionService } from "../services/junction/junction.service";
import { Box3, Vector3 } from "three";
import { Maths } from "../utils/maths";
import { RoadDividerService } from "../services/road/road-divider.service";
import { ConnectionService } from "../map/junction/connection/connection.service";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionManager {

	constructor (
		private roadLinkService: RoadLinkService,
		private mapService: MapService,
		private roadManager: RoadManager,
		private splineBuilder: SplineBuilder,
		private roadService: RoadService,
		private junctionFactory: JunctionFactory,
		private segmentService: SplineSegmentService,
		private linkService: RoadLinkService,
		private junctionService: JunctionService,
		private roadDividerService: RoadDividerService,
		private connectionService: ConnectionService
	) {
	}

	addJunction ( junction: TvJunction ) {

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			// TODO: use road manager
			this.roadService.add( connection.connectingRoad );

		}

	}

	removeJunction ( junction: TvJunction ) {

		this.removeJunctionNextSegment( junction );

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			// TODO: use road manager
			this.roadService.remove( connection.connectingRoad );

		}

		this.junctionFactory.IDService.remove( junction.id );
	}

	removeJunctions ( junctions: TvJunction[] ) {

		for ( let i = 0; i < junctions.length; i++ ) {

			this.removeJunction( junctions[ i ] );

		}

	}

	removeJunctionV2 ( junction: TvJunction ) {

		this.removeJunction( junction );

		this.mapService.map.removeJunction( junction );

	}

	removeJunctionNextSegment ( junction: TvJunction ) {

		const splines = junction.getIncomingSplines();

		for ( let i = 0; i < splines.length; i++ ) {

			const spline = splines[ i ];

			const previousSegment = spline.getPreviousSegment( junction );

			const nextSegment = spline.getNextSegment( junction );

			if ( nextSegment && nextSegment.isRoad && spline.segmentCount > 2 ) {

				const nextRoad = nextSegment.getInstance<TvRoad>();

				this.roadManager.removeRoad( nextRoad );

				this.roadLinkService.updateSuccessorRelation( nextRoad, previousSegment, nextRoad.successor );

			}

			if ( previousSegment && previousSegment.isRoad ) {

				const previousRoad = previousSegment.getInstance<TvRoad>();

				if ( nextSegment && nextSegment.isRoad ) {

					const nextRoad = nextSegment.getInstance<TvRoad>();

					previousRoad.successor = nextRoad.successor;

				} else {

					previousRoad.successor = null;

				}

			}

			if ( spline.findSegment( junction ) ) {

				this.segmentService.removeJunctionSegment( spline, junction );

			}

			this.splineBuilder.buildSpline( spline );
		}
	}

	updateJunctions ( spline: AbstractSpline ) {

		if ( spline.isConnectingRoad() ) return;

		// when a spline is updated
		// we first check if it has junctions or not
		const junctions = spline.getJunctions();

		this.removeJunctions( junctions );

		const intersections = this.getSplineIntersections( spline );

		const groups = this.createGroups( intersections );

		this.processGroups( groups );
	}

	private createGroups ( intersections: SplineIntersection[], thresholdDistance = 10 ): IntersectionGroup[] {

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

					const distance = intersection.position.distanceTo( otherIntersection.position );

					if ( distance <= thresholdDistance ) {

						group.addSplineIntersection( otherIntersection );

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

	private processGroup ( group: IntersectionGroup ) {

		const junction = this.createGroupJunction( group );

		const coords: TvRoadCoord[] = this.createGroupCoords( group, junction );

		const sortedCoords = GeometryUtils.sortCoordsByAngle( coords );

		for ( let i = 0; i < sortedCoords.length; i++ ) {

			const coordA = sortedCoords[ i ];

			for ( let j = i + 1; j < sortedCoords.length; j++ ) {

				const coordB = sortedCoords[ j ];

				// roads should be different
				if ( coordA.road === coordB.road ) continue;

				this.addConnections( junction, coordA, coordB );

			}

		}

		this.postProcessJunction( junction );

		this.junctionService.addJunction( junction );

	}

	private createGroupJunction ( group: IntersectionGroup ): TvJunction {

		const junctions = new Set<TvJunction>();

		const splines = group.getSplines();

		splines.forEach( spline => spline.getJunctions().forEach( junction => {

			const groupPosition = group.getRepresentativePosition();

			const bbox = junction.boundingBox || this.junctionService.computeBoundingBox( junction );

			if ( bbox.distanceToPoint( groupPosition ) < 10 ) {

				junctions.add( junction )

			}

		} ) );

		if ( junctions.size == 0 ) {

			return this.junctionFactory.createFromPosition( group.getRepresentativePosition() );

		}

		if ( junctions.size == 1 ) {

			return junctions.values().next().value;

		}

		throw new Error( 'Multiple junctions found in group' );

	}

	private createGroupCoords ( group: IntersectionGroup, junction: TvJunction ): TvRoadCoord[] {

		const splines = group.getSplines()

		const coords: TvRoadCoord[] = [];

		for ( let i = 0; i < splines.length; i++ ) {

			const spline = splines[ i ];

			const splineCoords = this.createRoadCoords( junction, spline, group );

			for ( let j = 0; j < splineCoords.length; j++ ) {

				coords.push( splineCoords[ j ] );

			}

		}

		return coords;

	}

	private createRoadCoords ( junction: TvJunction, spline: AbstractSpline, group: IntersectionGroup ): TvRoadCoord[] {

		const coords = [];

		const splineCoord = spline.getCoordAt( group.getRepresentativePosition() );

		// angle in radians
		// const angle = group.getApproachingAngle( spline );

		let junctionWidth = 12;

		// // increase width for sharper angles by some factor
		// if ( angle > Math.PI / 4 ) {
		// 	junctionWidth *= 2;
		// }

		const segment = spline.getSegmentAt( splineCoord.s );

		if ( !segment || !segment.isRoad ) {

			const previousSegment = spline.getPreviousSegment( segment.getInstance() );

			if ( previousSegment && previousSegment.isRoad ) {

				coords.push( previousSegment.getInstance<TvRoad>().getRoadCoordByContact( TvContactPoint.END ) );

			}

			const nextSegment = spline.getNextSegment( segment.getInstance() );

			if ( nextSegment && nextSegment.isRoad ) {

				coords.push( nextSegment.getInstance<TvRoad>().getRoadCoordByContact( TvContactPoint.START ) );

			}

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

			return this.createMiddleRoadCoords( spline, junction, sStart, sEnd );

		}

		return coords;
	}

	private createMiddleRoadCoords ( spline: AbstractSpline, junction: TvJunction, sStart: number, sEnd: number ): TvRoadCoord[] {

		const startSegment = spline.getSegmentAt( sStart );

		const coords = [];

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

		return coords;
	}

	getSplineIntersections ( spline: AbstractSpline ): SplineIntersection[] {

		const splines = this.mapService.nonJunctionSplines;
		const splineCount = splines.length;

		const successorSpline = spline.getSuccessorSpline();
		const predecessorSpline = spline.getPredecessorrSpline();

		const intersections: SplineIntersection[] = [];

		for ( let i = 0; i < splineCount; i++ ) {

			const otherSpline = splines[ i ];

			// NOTE: ignore pre or successor splines
			// MAY NEED TO FIND BETTER OPTION
			if ( otherSpline == spline ) continue;
			if ( otherSpline == successorSpline ) continue;
			if ( otherSpline == predecessorSpline ) continue;

			// const intersection = this.getSplineIntersectionPoint( spline, otherSpline );
			const intersection = this.getSplineIntersectionPointViaBounds( spline, otherSpline );
			// const intersection = this.getSplineIntersectionPointViaBoundsv2( spline, otherSpline );

			if ( !intersection ) continue;

			intersections.push( intersection );
		}

		return intersections;
	}

	getRoadIntersectionPoint ( roadA: TvRoad, roadB: TvRoad, stepSize = 1 ): Vector3 | null {

		if ( roadA.id == roadB.id ) return;

		if ( !this.intersectsRoadBox( roadA, roadB ) ) return;

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

					return Maths.findLineIntersection( a, b, c, d );

				}

			}

		}

	}

	getRoadIntersectionByBounds ( roadA: TvRoad, roadB: TvRoad, stepSize = 1, thresholdDistance = 1 ): Vector3 | null {

		if ( roadA.id == roadB.id ) return;

		if ( !this.intersectsRoadBox( roadA, roadB ) ) return;

		for ( let i = 0; i < roadA.length; i += stepSize ) {

			const posThetaA = roadA.getPosThetaAt( i );

			const widthA = ( posThetaA.t > 0 ? roadA.getLeftSideWidth( posThetaA.s ) : roadA.getRightsideWidth( posThetaA.s ) ) / 2;

			for ( let j = 0; j < roadB.length; j += stepSize ) {

				const posThetaB = roadB.getPosThetaAt( j );

				const widthB = ( posThetaB.t > 0 ? roadB.getLeftSideWidth( posThetaB.s ) : roadB.getRightsideWidth( posThetaB.s ) ) / 2;

				// Calculate the distance between points on roadA and roadB
				const distance = Math.sqrt( Math.pow( posThetaA.x - posThetaB.x, 2 ) + Math.pow( posThetaA.y - posThetaB.y, 2 ) + Math.pow( posThetaA.z - posThetaB.z, 2 ) );

				// Adjust the threshold distance by the widths of the roads
				const totalWidth = widthA + widthB;

				const adjustedThreshold = thresholdDistance + totalWidth;

				// If distance is within the adjusted threshold, we consider it an intersection
				if ( distance <= adjustedThreshold ) {
					return new Vector3( posThetaA.x, posThetaA.y, posThetaA.z ); // or return any relevant intersection point details
				}
			}
		}

	}

	getSplineIntersectionPoint ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): Vector3 | null {

		if ( splineA == splineB ) return;

		if ( !this.intersectsSplineBox( splineA, splineB ) ) return;

		const pointsA = splineA.getPoints( stepSize )
		const pointsB = splineB.getPoints( stepSize );

		for ( let i = 0; i < pointsA.length - 1; i++ ) {

			for ( let j = 0; j < pointsB.length - 1; j++ ) {

				const a = pointsA[ i ];
				const b = pointsA[ i + 1 ];
				const c = pointsB[ j ];
				const d = pointsB[ j + 1 ];

				const distance = a.distanceTo( c );

				if ( distance <= stepSize * 2 ) {

					return Maths.findLineIntersection( a, b, c, d );

				}

			}

		}

	}

	getSplineIntersectionPointViaBounds ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): SplineIntersection | null {

		function createBoundingBoxForSegment ( start: Vector3, end: Vector3, roadWidth: number ): Box3 {

			const box = new Box3();

			box.setFromCenterAndSize( start.clone().add( end ).multiplyScalar( 0.5 ), new Vector3( roadWidth, roadWidth, Math.abs( start.z - end.z ) ) );

			return box;

		}

		if ( splineA == splineB ) return;

		if ( !this.intersectsSplineBox( splineA, splineB ) ) return;

		const pointsA = splineA.getPoints( stepSize )
		const pointsB = splineB.getPoints( stepSize );

		for ( let i = 0; i < pointsA.length - 1; i++ ) {

			for ( let j = 0; j < pointsB.length - 1; j++ ) {

				const a = pointsA[ i ];
				const b = pointsA[ i + 1 ];
				const c = pointsB[ j ];
				const d = pointsB[ j + 1 ];

				const roadWidthA = this.segmentService.getWidthAt( splineA, a, i * stepSize );
				const roadWidthB = this.segmentService.getWidthAt( splineB, c, j * stepSize );

				// Create bounding boxes for the line segments
				const boxA = createBoundingBoxForSegment( a, b, roadWidthA );
				const boxB = createBoundingBoxForSegment( c, d, roadWidthB );

				// Check if these bounding boxes intersect
				if ( !this.intersectsBox( boxA, boxB ) ) continue;

				const intersectionPoint = Maths.findLineIntersection( a, b, c, d );

				if ( intersectionPoint ) {

					const angle = Maths.findLineIntersectionAngle( a, b, c, d );

					return new SplineIntersection( splineA, splineB, intersectionPoint, angle );
				}

			}

		}

	}

	getSplineIntersectionPointViaBoundsv2 ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): Vector3 | null {

		if ( splineA == splineB ) return;

		if ( !this.intersectsSplineBox( splineA, splineB ) ) return;

		const segmentsA = splineA.getSplineSegments();
		const segmentsB = splineB.getSplineSegments();

		for ( let i = 0; i < segmentsA.length; i++ ) {

			const segmentA = segmentsA[ i ];

			if ( !segmentA.isRoad ) continue;

			for ( let j = 0; j < segmentsB.length; j++ ) {

				const segmentB = segmentsB[ j ];

				if ( !segmentB.isRoad ) continue;

				const roadA = segmentA.getInstance<TvRoad>();
				const roadB = segmentB.getInstance<TvRoad>();

				const intersection = this.getRoadIntersectionByBounds( roadA, roadB, stepSize );

				if ( intersection ) return intersection;

			}

		}

	}

	checkSplineIntersections ( spline: AbstractSpline ) {

		const splines = this.mapService.nonJunctionSplines;
		const splineCount = splines.length;

		for ( let i = 0; i < splineCount; i++ ) {

			const otherSpline = splines[ i ];

			const intersection = this.getSplineIntersectionPoint( spline, otherSpline );

			if ( !intersection ) continue;

			const junction = this.createJunction( spline, otherSpline, intersection );

			this.junctionService.addJunction( junction );

		}

	}

	private intersectsRoadBox ( roadA: TvRoad, roadB: TvRoad ): boolean {

		if ( !roadA.boundingBox ) roadA.computeBoundingBox();
		if ( !roadB.boundingBox ) roadB.computeBoundingBox();

		return this.intersectsBox( roadA.boundingBox, roadB.boundingBox );

	}

	private intersectsSplineBox ( splineA: AbstractSpline, splineB: AbstractSpline ): boolean {

		return this.intersectsBox( splineA.boundingBox, splineB.boundingBox );

	}

	private intersectsBox ( boxA: Box3, boxB: Box3 ): boolean {

		// return true if we box is not generated
		if ( !boxA || !boxB ) return true;

		const boxIntersection = boxA.intersectsBox( boxB );

		return boxIntersection;

	}

	cutRoadForJunction ( coord: TvRoadCoord, junction: TvJunction ): TvRoadCoord {

		return this.roadDividerService.cutRoadForJunction( coord, junction );

	}

	private internal_createIntersectionFromCoords ( coordA: TvRoadCoord, coordB: TvRoadCoord ): TvJunction {

		const junction = this.junctionService.createNewJunction();

		const [ coordC, coordD ] = this.createNewSegments( junction, coordA, coordB );

		this.internal_addConnections( junction, coordA, coordB, coordC?.road, coordD?.road );

		// this.postProcessJunction( junction );

		return junction;

	}

	createNewSegments ( junction: TvJunction, coordA: TvRoadCoord, coordB: TvRoadCoord ): TvRoadCoord[] {

		const roadC = this.cutRoadForJunction( coordA, junction );
		const roadD = this.cutRoadForJunction( coordB, junction );

		return [ roadC, roadD ];
	}

	private internal_addConnections ( junction: TvJunction, coordA: TvRoadCoord, coordB: TvRoadCoord, roadC: TvRoad, roadD: TvRoad ) {

		this.junctionService.addConnectionsFromContact(
			junction,
			coordA.road,
			coordA.contact,
			coordB.road,
			coordB.contact
		);

		if ( roadC ) {

			this.junctionService.addConnectionsFromContact(
				junction,
				coordA.road,
				coordA.contact,
				roadC,
				TvContactPoint.START
			);

			this.junctionService.addConnectionsFromContact(
				junction,
				coordB.road,
				coordB.contact,
				roadC,
				TvContactPoint.START
			);
		}

		if ( roadD ) {

			this.junctionService.addConnectionsFromContact(
				junction,
				coordB.road,
				coordB.contact,
				roadD,
				TvContactPoint.START
			);

			this.junctionService.addConnectionsFromContact(
				junction,
				coordA.road,
				coordA.contact,
				roadD,
				TvContactPoint.START
			);

		}

		if ( roadC && roadD ) {

			this.junctionService.addConnectionsFromContact(
				junction,
				roadC,
				TvContactPoint.START,
				roadD,
				TvContactPoint.START
			);

		}

	}

	createJunction ( splineA: AbstractSpline, splineB: AbstractSpline, point: Vector3 ) {

		if ( splineA == splineB ) return;

		const splineCoordA = splineA.getCoordAt( point );
		const splineCoordB = splineB.getCoordAt( point );

		const segmentA = splineA.getSegmentAt( splineCoordA.s );
		const segmentB = splineB.getSegmentAt( splineCoordB.s );

		if ( !segmentA ) console.error( 'segmentA is null', splineA, splineCoordA );
		if ( !segmentB ) console.error( 'segmentB is null', splineB, splineCoordB );

		if ( !segmentA || !segmentA.isRoad ) {
			return
		}

		if ( !segmentB || !segmentB.isRoad ) {
			return
		}

		const roadA = segmentA.getInstance<TvRoad>();
		const roadB = segmentB.getInstance<TvRoad>();

		if ( !roadA || !roadB ) {
			return;
		}

		const coordA = roadA.getPosThetaByPosition( point ).toRoadCoord( roadA );
		const coordB = roadB.getPosThetaByPosition( point ).toRoadCoord( roadB );

		const junction = this.internal_createIntersectionFromCoords( coordA, coordB );

		return junction;

	}

	postProcessJunction ( junction: TvJunction ) {

		this.connectionService.postProcessJunction( junction );

	}

	createIntersectionByContact (
		coordA: TvRoadCoord,
		contactA: TvContactPoint,
		coordB: TvRoadCoord,
		contactB: TvContactPoint
	): TvJunction {

		// roads should be different
		if ( coordA.road === coordB.road ) {

			const junction = this.junctionService.createNewJunction();

			const coord = coordA.s > coordB.s ? coordA : coordB;

			const roadCCoord = this.cutRoadForJunction( coord, junction );

			this.junctionService.addConnectionsFromContact(
				junction,
				coordA.road,
				TvContactPoint.END,
				roadCCoord.road,
				TvContactPoint.START
			);

			this.postProcessJunction( junction );

			return junction;

		}

		// could be usefull to calculcating if we need
		// to add junction into the roads
		// const distance = coordA.distanceTo( coordB );

		if ( coordA.contactCheck == contactA && coordB.contactCheck == contactB ) {

			const junction = this.junctionService.createNewJunction();

			this.internal_addConnections( junction, coordA, coordB, null, null );

			this.postProcessJunction( junction );

			return junction;

		}

	}

	addConnections ( junction: TvJunction, coordA: TvRoadCoord, coordB: TvRoadCoord ) {

		this.junctionService.addConnectionsFromContact(
			junction,
			coordA.road,
			coordA.contact,
			coordB.road,
			coordB.contact
		);

	}

	createJunctionFromCoords ( coords: TvRoadCoord[] ): TvJunction {

		const junction = this.junctionFactory.createJunction();

		for ( let i = 0; i < coords.length; i++ ) {

			const coordA = coords[ i ];

			for ( let j = i + 1; j < coords.length; j++ ) {

				const coordB = coords[ j ];

				// roads should be different
				if ( coordA.road === coordB.road ) continue;

				this.addConnections( junction, coordA, coordB );

			}

		}

		this.postProcessJunction( junction );

		return junction;
	}
}

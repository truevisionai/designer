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
import { AbstractSpline } from "../core/shapes/abstract-spline";
import { SplineIntersection } from 'app/services/junction/spline-intersection';
import { IntersectionGroup } from "./Intersection-group";
import { TvRoadCoord } from "../map/models/TvRoadCoord";
import { GeometryUtils } from "../services/surface/surface-geometry.builder";
import { TvContactPoint } from "../map/models/tv-common";
import { TvRoadLinkChildType } from "../map/models/tv-road-link-child";
import { JunctionService } from "../services/junction/junction.service";
import { Vector3 } from "three";
import { RoadDividerService } from "../services/road/road-divider.service";
import { ConnectionService } from "../map/junction/connection/connection.service";
import { SplineService } from "app/services/spline/spline.service";
import { LaneLinkService } from "app/services/junction/lane-link.service";
import { TvJunctionBoundaryService } from "app/map/junction-boundary/tv-junction-boundary.service";
import { RoadBuilder } from "../map/builders/road.builder";

const JUNCTION_WIDTH = 10;

@Injectable( {
	providedIn: 'root'
} )
export class JunctionManager {

	constructor (
		public roadLinkService: RoadLinkService,
		public mapService: MapService,
		public roadManager: RoadManager,
		public splineBuilder: SplineBuilder,
		public roadBuilder: RoadBuilder,
		public roadService: RoadService,
		public junctionFactory: JunctionFactory,
		public linkService: RoadLinkService,
		public junctionService: JunctionService,
		public roadDividerService: RoadDividerService,
		public connectionService: ConnectionService,
		public splineService: SplineService,
		public laneLinkService: LaneLinkService,
		public junctionBoundaryService: TvJunctionBoundaryService,
	) {
	}

	addJunction ( junction: TvJunction ) {

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			// TODO: use road manager
			if ( !this.mapService.map.roads.includes( connection.connectingRoad ) ) {

				this.roadService.add( connection.connectingRoad );

			} else {

				this.roadManager.updateRoad( connection.connectingRoad );

			}

		}

		this.junctionBoundaryService.update( junction );

	}

	removeJunction ( junction: TvJunction ) {

		this.removeJunctionNextSegment( junction );

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			this.roadManager.removeRoad( connection.connectingRoad );

		}

		this.mapService.map.junctions.delete( junction.id );
	}

	removeJunctions ( junctions: TvJunction[] ) {

		for ( let i = 0; i < junctions.length; i++ ) {

			this.removeJunction( junctions[ i ] );

		}

	}

	removeJunctionNextSegment ( junction: TvJunction ) {

		const splines = junction.getIncomingSplines();

		for ( let i = 0; i < splines.length; i++ ) {

			const spline = splines[ i ];

			const previousSegment = spline.segmentMap.getPrevious( junction );

			const nextSegment = spline.segmentMap.getNext( junction );

			if ( nextSegment instanceof TvRoad && spline.segmentMap.size > 2 ) {

				this.roadManager.removeRoad( nextSegment );

				this.roadLinkService.updateSuccessorRelation( nextSegment, previousSegment, nextSegment.successor );

			}

			if ( previousSegment instanceof TvRoad ) {

				const previousRoad = previousSegment;

				if ( nextSegment instanceof TvRoad ) {

					previousRoad.successor = nextSegment.successor;

				} else {

					previousRoad.successor = null;

				}

			}

			if ( this.splineService.hasSegment( spline, junction ) ) {

				this.splineService.removeJunctionSegment( spline, junction );

			}

			this.splineBuilder.buildSpline( spline );

			if ( previousSegment instanceof TvRoad ) {
				this.roadBuilder.rebuildRoad( previousSegment, this.mapService.map );
			}

		}
	}

	updateJunctions ( spline: AbstractSpline ) {

		if ( this.splineService.isConnectionRoad( spline ) ) return;

		// when a spline is updated
		// we first check if it has junctions or not
		const junctions = this.splineService.getJunctions( spline );

		this.removeJunctions( junctions );

		const intersections = this.splineService.findIntersections( spline );

		const groups = this.createGroups( intersections );

		this.processGroups( groups );
	}

	checkSplineIntersections ( spline: AbstractSpline ) {

		const splines = this.mapService.nonJunctionSplines;
		const splineCount = splines.length;

		for ( let i = 0; i < splineCount; i++ ) {

			const otherSpline = splines[ i ];

			const intersection = this.splineService.findIntersection( spline, otherSpline );

			if ( !intersection ) continue;

			const junction = this.createJunction( spline, otherSpline, intersection );

			this.junctionService.addJunction( junction );

		}

	}

	createGroups ( intersections: SplineIntersection[], thresholdDistance = 10 ): IntersectionGroup[] {

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

	processGroups = ( groups: IntersectionGroup[] ) => {

		for ( let i = 0; i < groups.length; i++ ) {

			this.processGroup( groups[ i ] );

		}

	}

	processGroup ( group: IntersectionGroup ): void {

		function getHeading ( coord: TvRoadCoord ) {

			if ( coord.contact == TvContactPoint.START ) {
				return coord.h + Math.PI;
			}

			return coord.h;

		}

		const junction = this.createGroupJunction( group );

		if ( !junction ) return;

		const coords: TvRoadCoord[] = this.createGroupCoords( group, junction );

		// readjust coords based on angle between roads

		for ( let i = 0; i < coords.length; i++ ) {

			const coordA = coords[ i ];

			let rightConnectionCreated = false;

			for ( let j = i + 1; j < coords.length; j++ ) {

				const coordB = coords[ j ];

				// roads should be different
				if ( coordA.road === coordB.road ) continue;

				// const coordAHeading = getHeading( coordA );
				// const coordBHeading = getHeading( coordB );

				// const angle = Math.abs( coordAHeading - coordBHeading );

				// console.log( coordA.roadId, coordB.roadId, 'angle', angle, coordA.h, coordB.h );

				this.junctionService.setLink( coordA.road, coordA.contact, junction );

				this.junctionService.setLink( coordB.road, coordB.contact, junction );

				// ----------------------------

				const connectionAB = this.connectionService.createConnection( junction, coordA, coordB, !rightConnectionCreated );

				this.connectionService.postProcessConnection( junction, connectionAB, !rightConnectionCreated );

				junction.addConnection( connectionAB );

				// ----------------------------

				// check if this is the first and last connection
				const isFirstAndLast = i == 0 && j == coords.length - 1;

				const connectionBA = this.connectionService.createConnection( junction, coordB, coordA, isFirstAndLast );

				this.connectionService.postProcessConnection( junction, connectionBA, isFirstAndLast );

				junction.addConnection( connectionBA );

				rightConnectionCreated = true;

			}

		}

		this.junctionService.addJunction( junction );

	}

	createGroupJunction ( group: IntersectionGroup ): TvJunction {

		const junctions = new Set<TvJunction>();

		const splines = group.getSplines();

		splines.forEach( spline => this.splineService.getJunctions( spline ).forEach( junction => {

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

		console.error( 'Multiple junctions found in group' );

	}

	createGroupCoords ( group: IntersectionGroup, junction: TvJunction ): TvRoadCoord[] {

		const splines = group.getSplines()

		const coords: TvRoadCoord[] = [];

		for ( let i = 0; i < splines.length; i++ ) {

			const spline = splines[ i ];

			const splineCoords = this.createRoadCoords( junction, spline, group );

			for ( let j = 0; j < splineCoords.length; j++ ) {

				coords.push( splineCoords[ j ] );

				// DebugDrawService.instance.drawSphere( splineCoords[ j ].position, 1.0, COLOR.MAGENTA );

			}

		}

		const sortedCoords = GeometryUtils.sortCoordsByAngle( coords );

		// console.log( 'sortedCoords', sortedCoords );
		// console.log( 'sortedCoords', sortedCoords.map( coord => coord.roadId ) );

		return sortedCoords;

	}

	createRoadCoords ( junction: TvJunction, spline: AbstractSpline, group: IntersectionGroup ): TvRoadCoord[] {
		const coords = [];
		const junctionCenterPoint = this.splineService.getCoordAt( spline, group.getRepresentativePosition() );
		const segment = spline.segmentMap.findAt( junctionCenterPoint.s );

		if ( !segment || !( segment instanceof TvRoad ) ) {
			if ( !segment ) return coords;
			this.addCoordsFromAdjacentSegments( spline, coords, segment );
			return coords;
		}

		const junctionWidth = this.computeJunctionWidth( group );
		const sStart = junctionCenterPoint.s - junctionWidth;
		const sEnd = junctionCenterPoint.s + junctionWidth;
		const startSegment = spline.segmentMap.findAt( sStart );
		const endSegment = spline.segmentMap.findAt( sEnd );
		const differentRoads = startSegment && endSegment ? startSegment != endSegment : false;

		if ( differentRoads ) {
			// Handle junction segment for different roads
		} else if ( this.isAtStartOrEndOfSpline( spline, sStart, sEnd, junctionWidth ) ) {
			this.handleStartOrEndOfSpline( spline, junction, coords, sStart, sEnd, startSegment, endSegment, junctionWidth );
		} else {
			return this.createMiddleRoadCoords( spline, junction, sStart, sEnd );
		}

		return coords;
	}

	addCoordsFromAdjacentSegments ( spline: AbstractSpline, coords: TvRoadCoord[], segment: any ) {
		const previousSegment = spline.segmentMap.getPrevious( segment );
		if ( previousSegment instanceof TvRoad ) {
			coords.push( previousSegment.getRoadCoordByContact( TvContactPoint.END ) );
		}
		const nextSegment = spline.segmentMap.getNext( segment );
		if ( nextSegment instanceof TvRoad ) {
			coords.push( nextSegment.getRoadCoordByContact( TvContactPoint.START ) );
		}
	}

	isAtStartOrEndOfSpline ( spline: AbstractSpline, sStart: number, sEnd: number, junctionWidth: number ): boolean {
		const splineLength = this.splineService.getLength( spline );
		return sStart <= junctionWidth || sEnd >= splineLength - junctionWidth;
	}

	handleStartOrEndOfSpline ( spline: AbstractSpline, junction: TvJunction, coords: TvRoadCoord[], sStart: number, sEnd: number, segment: TvRoad, endSegment: TvRoad, junctionWidth: number ) {
		const splineLength = this.splineService.getLength( spline );
		const atStart = sStart <= junctionWidth;
		const atEnd = sEnd >= splineLength - junctionWidth;

		if ( atEnd && endSegment instanceof TvRoad ) {
			this.addEndSegmentCoords( spline, junction, coords, sStart, endSegment );
		} else if ( atStart ) {
			this.addStartSegmentCoords( spline, junction, coords, junctionWidth );
		}
	}

	addEndSegmentCoords ( spline: AbstractSpline, junction: TvJunction, coords: TvRoadCoord[], sStart: number, endSegment: TvRoad ) {
		this.splineService.addJunctionSegment( spline, sStart, junction );
		this.rebuildRoad( endSegment );
		coords.push( endSegment.getRoadCoordByContact( TvContactPoint.END ) );
	}

	addStartSegmentCoords ( spline: AbstractSpline, junction: TvJunction, coords: TvRoadCoord[], junctionWidth: number ) {
		const road = this.splineService.findFirstRoad( spline );
		road.sStart = junctionWidth;
		this.splineService.addJunctionSegment( spline, 0, junction );
		road.setPredecessor( TvRoadLinkChildType.junction, junction );
		this.rebuildRoad( road );
		coords.push( road.getRoadCoordByContact( TvContactPoint.START ) );
	}

	createMiddleRoadCoords ( spline: AbstractSpline, junction: TvJunction, sStart: number, sEnd: number ): TvRoadCoord[] {
		const startSegment = spline.segmentMap.findAt( sStart );
		if ( !( startSegment instanceof TvRoad ) ) return [];

		this.splineService.addJunctionSegment( spline, sStart, junction );
		const newRoad = this.roadService.clone( startSegment, sStart );
		newRoad.sStart = sEnd;
		this.splineService.addRoadSegmentNew( spline, sEnd, newRoad );
		newRoad.setPredecessor( TvRoadLinkChildType.junction, junction );
		startSegment.setSuccessor( TvRoadLinkChildType.junction, junction );
		this.linkService.updateSuccessorRelationWhileCut( newRoad, newRoad.successor, startSegment );

		this.mapService.map.addRoad( newRoad );
		this.splineBuilder.buildSpline( newRoad.spline );
		this.roadBuilder.rebuildRoad( newRoad, this.mapService.map );
		this.splineBuilder.buildSpline( startSegment.spline );
		this.roadBuilder.rebuildRoad( startSegment, this.mapService.map );

		return [
			new TvRoadCoord( startSegment, startSegment.length ),
			new TvRoadCoord( newRoad, 0 )
		];
	}

	rebuildRoad ( road: TvRoad ) {
		this.splineBuilder.buildSpline( road.spline );
		this.roadBuilder.rebuildRoad( road, this.mapService.map );
	}


	// createRoadCoords ( junction: TvJunction, spline: AbstractSpline, group: IntersectionGroup ): TvRoadCoord[] {
	//
	// 	const coords = [];
	//
	// 	const junctionCenterPoint = this.splineService.getCoordAt( spline, group.getRepresentativePosition() );
	//
	// 	// angle in radians
	// 	// const angle = group.getApproachingAngle( spline );
	//
	// 	// // increase width for sharper angles by some factor
	// 	// if ( angle > Math.PI / 4 ) {
	// 	// 	junctionWidth *= 2;
	// 	// }
	//
	// 	const segment = spline.segmentMap.findAt( junctionCenterPoint.s );
	//
	// 	if ( !segment || !( segment instanceof TvRoad ) ) {
	//
	// 		const previousSegment = spline.segmentMap.getPrevious( segment );
	//
	// 		if ( previousSegment instanceof TvRoad ) {
	//
	// 			coords.push( previousSegment.getRoadCoordByContact( TvContactPoint.END ) );
	//
	// 		}
	//
	// 		const nextSegment = spline.segmentMap.getNext( segment );
	//
	// 		if ( nextSegment instanceof TvRoad ) {
	//
	// 			coords.push( nextSegment.getRoadCoordByContact( TvContactPoint.START ) );
	//
	// 		}
	//
	// 		return coords;
	// 	}
	//
	// 	const sStart = junctionCenterPoint.s - JUNCTION_WIDTH;
	// 	const sEnd = junctionCenterPoint.s + JUNCTION_WIDTH;
	//
	// 	const startSegment = spline.segmentMap.findAt( sStart );
	// 	const endSegment = spline.segmentMap.findAt( sEnd );
	//
	// 	const differentRoads = startSegment && endSegment ? startSegment != endSegment : false;
	//
	// 	if ( differentRoads ) {
	//
	// 		// coord is at the junction or joining of two roads
	// 		// add junction segment on spline and update both roads
	//
	// 	} else if ( sStart <= JUNCTION_WIDTH || sEnd > this.splineService.getLength( spline ) ) {
	//
	// 		// coord is at the start/end of the road
	// 		// add junction segment on spline and update road
	//
	// 		const atStart = sStart <= 0;
	// 		const atEnd = sEnd >= this.splineService.getLength( spline );
	//
	// 		if ( atEnd && endSegment instanceof TvRoad ) {
	//
	// 			const road = endSegment;
	//
	// 			const sStartJunction = junctionCenterPoint.s - JUNCTION_WIDTH;
	//
	// 			this.splineService.addJunctionSegment( spline, sStartJunction, junction );
	//
	// 			this.splineBuilder.buildSpline( road.spline );
	// 			this.roadBuilder.rebuildRoad( road, this.mapService.map );
	//
	// 			road.setSuccessor( TvRoadLinkChildType.junction, junction );
	//
	// 			coords.push( road.getRoadCoordByContact( TvContactPoint.END ) );
	//
	// 		} else if ( atStart ) {
	//
	// 			const road = this.splineService.findFirstRoad( spline );
	//
	// 			const sEndJunction = JUNCTION_WIDTH;
	//
	// 			road.sStart = sEndJunction;
	//
	// 			this.splineService.addJunctionSegment( spline, 0, junction );
	//
	// 			road.setPredecessor( TvRoadLinkChildType.junction, junction );
	//
	// 			this.splineBuilder.buildSpline( road.spline );
	// 			this.roadBuilder.rebuildRoad( road, this.mapService.map );
	//
	// 			coords.push( road.getRoadCoordByContact( TvContactPoint.START ) );
	//
	// 		}
	//
	// 	} else {
	//
	// 		return this.createMiddleRoadCoords( spline, junction, sStart, sEnd );
	//
	// 	}
	//
	// 	return coords;
	// }

	// createMiddleRoadCoords ( spline: AbstractSpline, junction: TvJunction, sStart: number, sEnd: number ): TvRoadCoord[] {
	//
	// 	const startSegment = spline.segmentMap.findAt( sStart );
	//
	// 	const coords = [];
	//
	// 	if ( !( startSegment instanceof TvRoad ) ) return [];
	//
	// 	// coord is in the middle of the road
	// 	// add junction segment on spline and add new road
	// 	const oldRoad = startSegment;
	//
	// 	this.splineService.addJunctionSegment( spline, sStart, junction );
	//
	// 	const newRoad = this.roadService.clone( startSegment, sStart );
	//
	// 	newRoad.sStart = sEnd;
	//
	// 	this.splineService.addRoadSegmentNew( spline, sEnd, newRoad );
	//
	// 	newRoad.setPredecessor( TvRoadLinkChildType.junction, junction );
	//
	// 	oldRoad.setSuccessor( TvRoadLinkChildType.junction, junction );
	//
	// 	this.linkService.updateSuccessorRelationWhileCut( newRoad, newRoad.successor, oldRoad );
	//
	// 	this.mapService.map.addRoad( newRoad );
	// 	this.splineBuilder.buildSpline( newRoad.spline );
	// 	this.roadBuilder.rebuildRoad( newRoad, this.mapService.map );
	//
	// 	this.splineBuilder.buildSpline( oldRoad.spline );
	// 	this.roadBuilder.rebuildRoad( oldRoad, this.mapService.map );
	//
	// 	coords.push( new TvRoadCoord( oldRoad, oldRoad.length ) );
	// 	coords.push( new TvRoadCoord( newRoad, 0 ) );
	//
	// 	return coords;
	// }

	cutRoadForJunction ( coord: TvRoadCoord, junction: TvJunction ): TvRoadCoord {

		return this.roadDividerService.cutRoadForJunction( coord, junction );

	}

	internal_createIntersectionFromCoords ( coordA: TvRoadCoord, coordB: TvRoadCoord ): TvJunction {

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

	internal_addConnections ( junction: TvJunction, coordA: TvRoadCoord, coordB: TvRoadCoord, roadC: TvRoad, roadD: TvRoad ) {

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

		const splineCoordA = this.splineService.getCoordAt( splineA, point );
		const splineCoordB = this.splineService.getCoordAt( splineB, point );

		const segmentA = splineA.segmentMap.findAt( splineCoordA.s );
		const segmentB = splineB.segmentMap.findAt( splineCoordB.s );

		if ( !segmentA ) console.error( 'segmentA is null', splineA, splineCoordA );
		if ( !segmentB ) console.error( 'segmentB is null', splineB, splineCoordB );

		if ( !segmentA || !( segmentA instanceof TvRoad ) ) {
			return
		}

		if ( !segmentB || !( segmentB instanceof TvRoad ) ) {
			return
		}

		const roadA = segmentA;
		const roadB = segmentB;

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

	computeJunctionWidth ( group: IntersectionGroup ) {

		let maxWidth = JUNCTION_WIDTH;

		const splines = group.getSplines();

		const center = group.getRepresentativePosition();

		for ( let i = 0; i < splines.length; i++ ) {

			const spline = splines[ i ];

			const posTheta = this.splineService.getCoordAt( spline, center );

			const segment = spline.segmentMap.findAt( posTheta.s );

			if ( segment instanceof TvRoad ) {

				const width = segment.getRoadWidthAt( posTheta.s - segment.sStart )?.totalWidth;

				if ( width && width > maxWidth ) {

					maxWidth = width;

				}
			}
		}

		// add just for saftey margin
		return maxWidth + 2;
	}

	adjustRoadCoordByHeading ( a: TvRoadCoord, b: TvRoadCoord, radius = 50 ) {

		const angleInRadians = Math.abs( a.h - b.h );

		const diff = Math.abs( Math.PI - angleInRadians );

		const desiredDistance = radius * Math.tan( diff / 2 );

	}

	adjustJunctionCoords ( coords: TvRoadCoord[], radius = 50 ) {

		for ( let i = 0; i < coords.length; i++ ) {

			const coordA = coords[ i ];

			const nextIndex = i + 1;

			if ( nextIndex >= coords.length ) continue;

			const coordB = coords[ nextIndex ];

			// calculate intersection point
			// const intersectionPoint = Maths.findIntersection( coordA.toPosTheta(), coordB.toPosTheta() );

			const angle = Math.abs( coordA.h - coordB.h );

			const diff = Math.abs( Math.PI - angle );

			const targetDistance = radius * Math.tan( diff / 2 );

			// find target position from intersection point which is further away as per targetDistance
			// const targetPosition = intersectionPoint.clone().add( new Vector3().subVectors( coordA.position, intersectionPoint ).setLength( targetDistance ) );
		}

	}
}

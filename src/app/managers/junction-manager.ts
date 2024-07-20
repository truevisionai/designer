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
import { AbstractSpline, SplineType } from "../core/shapes/abstract-spline";
import { SplineIntersection } from 'app/services/junction/spline-intersection';
import { IntersectionGroup } from "./Intersection-group";
import { TvRoadCoord } from "../map/models/TvRoadCoord";
import { TvContactPoint } from "../map/models/tv-common";
import { TvRoadLink, TvRoadLinkType } from "../map/models/tv-road-link";
import { JunctionService } from "../services/junction/junction.service";
import { RoadDividerService } from "../services/road/road-divider.service";
import { ConnectionService } from "../map/junction/connection/connection.service";
import { SplineService } from "app/services/spline/spline.service";
import {
	TvJunctionBoundaryManager,
	TvJunctionBoundaryBuilder
} from "app/map/junction-boundary/tv-junction-boundary.builder";
import { RoadBuilder } from "../map/builders/road.builder";
import { Maths } from "app/utils/maths";
import { JunctionConnectionFactory } from "app/factories/junction-connection.factory";
import { JunctionBuilder } from "app/services/junction/junction.builder";
import { GeometryUtils } from "app/services/surface/geometry-utils";
import { SplineFactory } from "app/services/spline/spline.factory";
import { RoadUtils } from "../utils/road.utils";
import { MathUtils, Vector2, Vector3 } from "three";
import { DebugDrawService } from "../services/debug/debug-draw.service";
import { COLOR } from "../views/shared/utils/colors.service";
import { TvPosTheta } from "app/map/models/tv-pos-theta";

const JUNCTION_WIDTH = 10;

@Injectable( {
	providedIn: 'root'
} )
export class JunctionManager {

	private debug = false;

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
		public boundaryManager: TvJunctionBoundaryManager,
		public connectionFactory: JunctionConnectionFactory,
		public junctionBuilder: JunctionBuilder,
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

		this.updateBoundary( junction );

		// if ( junction.mesh ) this.mapService.map.gameObject.remove( junction.mesh );

		// junction.mesh = this.junctionBuilder.build( junction );

		// this.mapService.map.gameObject.add( junction.mesh );

	}

	updateBoundary ( junction: TvJunction ) {

		this.boundaryManager.update( junction );

		junction.boundingBox = this.junctionService.computeBoundingBox( junction );


	}

	removeJunction ( junction: TvJunction, spline?: AbstractSpline ) {

		const incomingSplines = junction.getIncomingSplines();

		for ( let i = 0; i < incomingSplines.length; i++ ) {

			this.removeNextSegment( incomingSplines[ i ], junction );

		}

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			this.roadManager.removeRoad( connection.connectingRoad );

			if ( this.debug ) console.debug( 'removeConnectionRoad', connection.connectingRoad );

		}

		this.mapService.map.removeJunction( junction );

		if ( incomingSplines.length > 2 && spline ) {

			const other = incomingSplines.find( s => s != spline );

			const others = incomingSplines.filter( s => s != spline );

			const intersections = this.splineService.findIntersections( other, others );

			const groups = this.createGroups( intersections );

			for ( const group of groups ) {

				this.convertGroupToJunction( group );

			}

		} else {

			spline?.segmentMap.remove( junction );

			console.debug( '[JunctionManager]: removing junction', junction );

		}

		// if ( junction.mesh ) this.mapService.map.gameObject.remove( junction.mesh );

	}

	removeNextSegment ( spline: AbstractSpline, junction: TvJunction ) {

		function updateFirstSegment () {

			const firsSegment = spline.segmentMap.getFirst();

			if ( firsSegment instanceof TvRoad ) {
				firsSegment.sStart = 0;
				spline.segmentMap.remove( firsSegment );
				spline.segmentMap.set( 0, firsSegment );
			}
		}


		if ( spline.segmentMap.length < 2 ) {
			if ( this.debug ) console.info( 'Spline has less than 2 segments' );
			return;
		}

		const previousSegment = spline.segmentMap.getPrevious( junction );
		const nextSegment = spline.segmentMap.getNext( junction );

		if ( !previousSegment && !nextSegment ) return;

		const roadCount = this.splineService.getRoads( spline ).length;

		this.updateLinks( previousSegment, nextSegment, roadCount );

		spline.segmentMap.remove( junction );

		updateFirstSegment();

		this.splineBuilder.buildSpline( spline );

		this.splineBuilder.buildSegments( spline );

		this.splineBuilder.buildBoundingBox( spline );

	}

	updateLinks ( previousSegment: TvRoad | TvJunction, nextSegment: TvRoad | TvJunction, roadCount: number ) {

		let isNextSegmentRemoved = false;

		if ( roadCount > 1 && nextSegment instanceof TvRoad ) {

			// // we assume true bu default
			// let laneSectionMatches = true;

			// if ( previousSegment instanceof TvRoad && nextSegment instanceof TvRoad ) {
			// 	// check if they have same lansection or not
			// 	const laneSectionA = previousSegment.getLastLaneSection();
			// 	const laneSectionB = nextSegment.getFirstLaneSection();
			// 	laneSectionMatches = laneSectionA.isMatching( laneSectionB );
			// }

			// if the next segment has no successor we can remove it safely
			// if the next segment has road we can remove it
			if ( ( !nextSegment.successor || nextSegment.successor?.isRoad ) ) {

				this.roadManager.removeRoad( nextSegment );

				this.roadLinkService.updateSuccessorRelation( nextSegment, previousSegment, nextSegment.successor );

				isNextSegmentRemoved = true;

				console.debug( 'road after junction removed', nextSegment.toString() );

			} else {

				if ( previousSegment instanceof TvRoad ) {

					// Update Link Relations if Next Road
					// Connect Next With Previous
					nextSegment.setPredecessorRoad( previousSegment, TvContactPoint.END );

				} else {

					console.debug( 'Previous Segment is not a Road' );

				}

			}

		} else if ( nextSegment instanceof TvRoad ) {

			if ( previousSegment instanceof TvRoad ) {

				nextSegment.setPredecessorRoad( previousSegment, TvContactPoint.END );

			} else {

				nextSegment.predecessor = null;

			}

		}


		if ( previousSegment instanceof TvRoad ) {

			if ( isNextSegmentRemoved ) {

				if ( nextSegment instanceof TvRoad ) {

					// because next segment will be removed
					previousSegment.successor = nextSegment.successor;

				} else {

					throw new Error( 'Next Segment is not a Road' );

				}

			} else if ( nextSegment instanceof TvRoad ) {

				// Update Link Relations with Next Road
				// Connect Previous With Next
				previousSegment.setSuccessorRoad( nextSegment, TvContactPoint.START );

			} else if ( nextSegment instanceof TvJunction ) {

				previousSegment.setPredecessor( TvRoadLinkType.JUNCTION, nextSegment );

			} else {

				previousSegment.successor = null;

			}

		} else if ( previousSegment instanceof TvJunction ) {

			console.debug( 'Previous Segment is Junction' );

		} else {

			console.debug( 'Previous Segment is NULL' );

		}


	}

	updateJunctions ( spline: AbstractSpline ) {

		if ( this.splineService.isConnectionRoad( spline ) ) return;

		if ( spline.type == SplineType.EXPLICIT ) return;

		if ( this.debug ) console.debug( 'updateJunctions', spline );

		// when a spline is updated
		// we first check if it has junctions or not
		const junctions = this.splineService.getJunctions( spline );

		if ( this.debug ) console.debug( 'junctions-remove', junctions );

		for ( const junction of junctions ) {
			this.removeJunction( junction, spline );
		}

		const intersections = this.splineService.findIntersections( spline );

		if ( this.debug ) console.debug( 'intersections', intersections );

		const groups = this.createGroups( intersections );

		if ( this.debug ) console.debug( 'groups', groups );

		this.mergeGroups( groups );

		for ( const group of groups ) {
			this.convertGroupToJunction( group );
		}

	}

	mergeGroups ( groups: IntersectionGroup[] ) {

		for ( const group of groups ) {

			for ( const spline of group.getSplines() ) {

				spline.segmentMap.forEach( segment => {

					if ( segment instanceof TvJunction ) {

						const boundingBox = segment.boundingBox || this.junctionService.computeBoundingBox( segment );

						const distance = boundingBox.distanceToPoint( group.getRepresentativePosition() ) ?? Number.MAX_VALUE;

						if ( distance < 10 ) {

							segment.getIncomingSplines().forEach( incomingSpline => group.addSplineIntersection( new SplineIntersection(
								incomingSpline,
								spline,
								group.getRepresentativePosition()
							) ) );

							this.removeJunction( segment );

						}

					}

				} );

			}

		}

	}

	updateConnections ( junction: TvJunction, spline: AbstractSpline ) {

		// we will regenerate splines for each connecting road
		// no other modification is needed

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			const prevRoad = connection.connectingRoad.predecessor.element as TvRoad;
			const prevCoord = prevRoad.getRoadCoordByContact( connection.connectingRoad.predecessor.contactPoint );

			const nextRoad = connection.connectingRoad.successor.element as TvRoad;
			const nextRoadCoord = nextRoad.getRoadCoordByContact( connection.connectingRoad.successor.contactPoint );

			connection.laneLink.forEach( link => {

				const incomingLane = link.incomingLane;
				const connectingLane = link.connectingLane;
				const outgoingLane = nextRoad.laneSections[ 0 ].getLaneById( connectingLane.successorId );

				const newSpline = SplineFactory.createManeuverSpline( prevCoord.toLaneCoord( incomingLane ), nextRoadCoord.toLaneCoord( outgoingLane ) );

				connection.connectingRoad.spline.controlPoints = newSpline.controlPoints;

				this.splineBuilder.buildSpline( connection.connectingRoad.spline );

				this.splineBuilder.buildSegments( connection.connectingRoad.spline );

			} )

		}

	}

	// checkSplineIntersections ( spline: AbstractSpline ) {
	//
	// 	const splines = this.mapService.nonJunctionSplines;
	// 	const splineCount = splines.length;
	//
	// 	for ( let i = 0; i < splineCount; i++ ) {
	//
	// 		const otherSpline = splines[ i ];
	//
	// 		const intersection = this.splineService.findIntersection( spline, otherSpline );
	//
	// 		if ( !intersection ) continue;
	//
	// 		const junction = this.createJunction( spline, otherSpline, intersection );
	//
	// 		this.junctionService.addJunction( junction );
	//
	// 	}
	//
	// }

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

			group.centroid = group.getRepresentativePosition();

			groups.push( group );

		}

		return groups;
	}

	convertGroupToJunction ( group: IntersectionGroup ): void {

		const junction = this.createGroupJunction( group );

		if ( !junction ) return;

		const links: TvRoadLink[] = this.createGroupCoords( group, junction );

		if ( this.debug ) console.log( 'coords', links.length, links );

		for ( let i = 0; i < links.length; i++ ) {

			const linkA = links[ i ];

			let rightConnectionCreated = false;

			for ( let j = i + 1; j < links.length; j++ ) {

				const linkB = links[ j ];

				// roads should be different
				if ( linkA.element === linkB.element ) continue;

				if ( linkA.element instanceof TvJunction || linkB.element instanceof TvJunction ) continue;

				// check if this is the first and last connection
				const isFirstAndLast = i == 0 && j == links.length - 1;

				this.setLink( linkA.element, linkA.contactPoint, junction );

				this.setLink( linkB.element, linkB.contactPoint, junction );

				this.connectionFactory.createConnections( junction, linkA.toRoadCoord(), linkB.toRoadCoord(), !rightConnectionCreated );

				this.connectionFactory.createConnections( junction, linkB.toRoadCoord(), linkA.toRoadCoord(), isFirstAndLast );

				rightConnectionCreated = true;

			}

		}

		this.mapService.map.addJunctionInstance( junction );

		this.addJunction( junction );

		if ( this.debug ) console.log( 'add junction', junction );

	}

	setLink ( road: TvRoad, contact: TvContactPoint, junction: TvJunction ) {

		if ( contact == TvContactPoint.START ) {

			road.setPredecessor( TvRoadLinkType.JUNCTION, junction );

		} else if ( contact == TvContactPoint.END ) {

			road.setSuccessor( TvRoadLinkType.JUNCTION, junction );

		}

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

	createGroupCoords ( group: IntersectionGroup, junction: TvJunction ): TvRoadLink[] {

		const splines = group.getSplines()

		const coords: TvRoadLink[] = [];

		for ( let i = 0; i < splines.length; i++ ) {

			const spline = splines[ i ];

			const splineCoords = this.createRoadCoords( junction, spline, group );

			for ( let j = 0; j < splineCoords.length; j++ ) {

				coords.push( splineCoords[ j ] );

				// DebugDrawService.instance.drawSphere( splineCoords[ j ].position, 1.0, COLOR.MAGENTA );

			}

		}

		const sortedCoords = this.sortLinks( coords );

		return sortedCoords;
	}

	sortLinks ( links: TvRoadLink[] ): TvRoadLink[] {

		const points = links.map( coord => this.roadService.findLinkPosition( coord ) );

		let center = GeometryUtils.getCentroid( points.map( p => p.position ) );

		const angles = points.map( point => Math.atan2( point.y - center.y, point.x - center.x ) );

		return links.map( ( point, index ) => ( {
			point,
			index
		} ) ).sort( ( a, b ) => angles[ a.index ] - angles[ b.index ] ).map( sortedObj => sortedObj.point );

	}

	createRoadCoords ( junction: TvJunction, spline: AbstractSpline, group: IntersectionGroup ): TvRoadLink[] {

		const links: TvRoadLink[] = [];

		const junctionCenter = group.getRepresentativePosition();

		const junctionCoord = this.splineService.getCoordAt( spline, junctionCenter );

		const segment = spline.segmentMap.findAt( junctionCoord.s );

		if ( !segment || !( segment instanceof TvRoad ) ) {

			if ( !segment ) return links;

			this.addCoordsFromAdjacentSegments( spline, links, segment );

			return links;

		}

		const junctionWidth = this.computeJunctionWidth( group, spline );

		const sStart = Maths.clamp( junctionCoord.s - junctionWidth, 0, spline.getLength() );

		const sEnd = Maths.clamp( junctionCoord.s + junctionWidth, 0, spline.getLength() );

		const startSegment = spline.segmentMap.findAt( sStart );

		const endSegment = spline.segmentMap.findAt( sEnd );

		const isNearStart = () => sStart <= 0;

		const isNearEnd = () => sEnd >= this.splineService.getLength( spline );

		const differentRoads = startSegment && endSegment ? startSegment != endSegment : false;

		if ( differentRoads ) {

			// Handle junction segment for different roads
			console.debug( 'different roads', startSegment, endSegment );

			this.splineService.addJunctionSegment( spline, sStart - 5, junction );

			if ( startSegment instanceof TvRoad ) {

				links.push( new TvRoadLink( TvRoadLinkType.ROAD, startSegment, TvContactPoint.END ) );

				RoadUtils.unlinkSuccessor( startSegment );

			}

			if ( endSegment instanceof TvRoad ) {

				endSegment.sStart = sEnd + 5;

				links.push( new TvRoadLink( TvRoadLinkType.ROAD, endSegment, TvContactPoint.START ) );

				RoadUtils.unlinkPredecessor( endSegment );

			}

			this.splineBuilder.build( spline );

		} else if ( isNearStart() || isNearEnd() ) {

			if ( startSegment instanceof TvRoad && endSegment instanceof TvRoad ) {

				this.handleEdgeJunction( spline, junction, links, sStart, sEnd, startSegment, endSegment, junctionWidth );

			} else {

				console.error( spline, startSegment, endSegment );

			}

		} else {

			console.debug( 'cutting road', spline.uuid, junction.toString(), sStart, sEnd );

			return this.handleJunctionInMiddle( spline, junction, sStart, sEnd );

		}

		return links;
	}

	addCoordsFromAdjacentSegments ( spline: AbstractSpline, coords: TvRoadLink[], segment: any ) {

		console.debug( 'addCoordsFromAdjacentSegments', segment );

		const previousSegment = spline.segmentMap.getPrevious( segment );

		if ( previousSegment instanceof TvRoad ) {

			coords.push( new TvRoadLink( TvRoadLinkType.ROAD, previousSegment, TvContactPoint.END ) );

		}

		const nextSegment = spline.segmentMap.getNext( segment );

		if ( nextSegment instanceof TvRoad ) {

			coords.push( new TvRoadLink( TvRoadLinkType.ROAD, nextSegment, TvContactPoint.START ) );

		}

	}

	handleEdgeJunction ( spline: AbstractSpline, junction: TvJunction, coords: TvRoadLink[], sStart: number, sEnd: number, startSegment: TvRoad, mainRoad: TvRoad, junctionWidth: number ) {

		if ( !mainRoad ) return;

		const splineLength = this.splineService.getLength( spline );

		const hasPredecessor = startSegment.predecessor != null;

		const hasSuccessor = mainRoad.successor != null;

		const isNearStart = sStart <= 0;

		const isNearEnd = sEnd >= splineLength;

		if ( isNearEnd ) {

			console.debug( 'adding end segment coords', mainRoad.toString() );

			this.handleJunctionAtEnd( spline, junction, coords, sStart, mainRoad );

			if ( hasSuccessor ) {

				console.warn( 'hasSuccessor', mainRoad );

				const nextLink = mainRoad.successor?.clone();

				if ( nextLink.element instanceof TvRoad ) {

					RoadUtils.unlinkSuccessor( mainRoad );
					RoadUtils.unlinkPredecessor( nextLink.element );

					coords.push( new TvRoadLink( TvRoadLinkType.ROAD, nextLink.element, nextLink.contactPoint ) );

				} else {

					console.warn( 'nextLink is not a road', nextLink );

				}

			}

		} else if ( isNearStart ) {

			console.debug( 'adding start segment coords', startSegment );

			if ( hasPredecessor ) {

				console.debug( 'hasPredecessor', startSegment );

				this.handleJunctionAtStart( spline, junction, coords, junctionWidth );

			} else {

				this.handleJunctionAtStart( spline, junction, coords, junctionWidth );

			}

		} else {

			throw new Error( 'Invalid start/end segment' );

		}
	}

	handleJunctionAtEnd ( spline: AbstractSpline, junction: TvJunction, coords: TvRoadLink[], sStartJunction: number, road: TvRoad ) {

		this.splineService.addJunctionSegment( spline, sStartJunction, junction );

		this.rebuildRoad( road );

		coords.push( new TvRoadLink( TvRoadLinkType.ROAD, road, TvContactPoint.END ) );

	}

	handleJunctionAtStart ( spline: AbstractSpline, junction: TvJunction, coords: TvRoadLink[], junctionWidth: number ) {

		const road = this.splineService.findFirstRoad( spline );

		road.sStart = junctionWidth;

		spline.segmentMap.remove( road );

		spline.segmentMap.set( junctionWidth, road );

		spline.segmentMap.set( 0, junction );

		road.setPredecessor( TvRoadLinkType.JUNCTION, junction );

		this.rebuildRoad( road );

		coords.push( new TvRoadLink( TvRoadLinkType.ROAD, road, TvContactPoint.START ) );

	}

	handleJunctionInMiddle ( spline: AbstractSpline, junction: TvJunction, sStart: number, sEnd: number ): TvRoadLink[] {

		const segment = spline.segmentMap.findAt( sStart );

		if ( !( segment instanceof TvRoad ) ) {
			console.error( 'startSegment is not a road', segment, sStart, sEnd );
			return [];
		}

		const mainRoad = segment as TvRoad;

		const newRoad = this.createNewRoadSegment( spline, mainRoad, junction, sStart, sEnd );

		console.debug( 'created new segment', newRoad.toString(), mainRoad.toString(), junction.toString(), sStart, sEnd );

		return [
			new TvRoadLink( TvRoadLinkType.ROAD, mainRoad, TvContactPoint.END ),
			new TvRoadLink( TvRoadLinkType.ROAD, newRoad, TvContactPoint.START )
		];
	}

	createNewRoadSegment ( spline: AbstractSpline, oldRoad: TvRoad, junction: TvJunction, sStart: number, sEnd: number ): TvRoad {

		const clone = this.roadService.clone( oldRoad, sStart );

		clone.sStart = sEnd;

		this.splineService.addRoadSegmentNew( spline, sEnd, clone );

		if ( oldRoad.successor?.isRoad ) {

			const successor = oldRoad.successor.getElement<TvRoad>();

			successor.setPredecessorRoad( clone, TvContactPoint.END );

			clone.successor = oldRoad.successor.clone();

		} else if ( oldRoad.successor?.isJunction ) {

			clone.successor = oldRoad.successor.clone();

			this.replaceConnections( oldRoad.successor.element as TvJunction, oldRoad, clone, TvContactPoint.END )

		}

		clone.setPredecessor( TvRoadLinkType.JUNCTION, junction );

		oldRoad.setSuccessor( TvRoadLinkType.JUNCTION, junction );

		this.linkService.updateSuccessorRelationWhileCut( clone, clone.successor, oldRoad );

		this.mapService.map.addRoad( clone );

		this.splineService.addJunctionSegment( spline, sStart, junction );

		this.splineBuilder.buildSpline( spline );

		this.splineBuilder.buildSegments( spline );

		return clone;

	}

	rebuildRoad ( road: TvRoad ) {

		this.splineBuilder.buildSpline( road.spline );

		this.splineBuilder.buildSegments( road.spline );

		this.splineBuilder.buildBoundingBox( road.spline );

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

	// cutRoadForJunction ( coord: TvRoadCoord, junction: TvJunction ): TvRoadCoord {
	//
	// 	return this.roadDividerService.cutRoadForJunction( coord, junction );
	//
	// }

	// internal_createIntersectionFromCoords ( coordA: TvRoadCoord, coordB: TvRoadCoord ): TvJunction {
	//
	// 	const junction = this.junctionService.createNewJunction();
	//
	// 	const [ coordC, coordD ] = this.createNewSegments( junction, coordA, coordB );
	//
	// 	this.internal_addConnections( junction, coordA, coordB, coordC?.road, coordD?.road );
	//
	// 	// this.postProcessJunction( junction );
	//
	// 	return junction;
	//
	// }

	// createNewSegments ( junction: TvJunction, coordA: TvRoadCoord, coordB: TvRoadCoord ): TvRoadCoord[] {
	//
	// 	const roadC = this.cutRoadForJunction( coordA, junction );
	// 	const roadD = this.cutRoadForJunction( coordB, junction );
	//
	// 	return [ roadC, roadD ];
	// }

	// internal_addConnections ( junction: TvJunction, coordA: TvRoadCoord, coordB: TvRoadCoord, roadC: TvRoad, roadD: TvRoad ) {
	//
	// 	this.junctionService.addConnectionsFromContact(
	// 		junction,
	// 		coordA.road,
	// 		coordA.contact,
	// 		coordB.road,
	// 		coordB.contact
	// 	);
	//
	// 	if ( roadC ) {
	//
	// 		this.junctionService.addConnectionsFromContact(
	// 			junction,
	// 			coordA.road,
	// 			coordA.contact,
	// 			roadC,
	// 			TvContactPoint.START
	// 		);
	//
	// 		this.junctionService.addConnectionsFromContact(
	// 			junction,
	// 			coordB.road,
	// 			coordB.contact,
	// 			roadC,
	// 			TvContactPoint.START
	// 		);
	// 	}
	//
	// 	if ( roadD ) {
	//
	// 		this.junctionService.addConnectionsFromContact(
	// 			junction,
	// 			coordB.road,
	// 			coordB.contact,
	// 			roadD,
	// 			TvContactPoint.START
	// 		);
	//
	// 		this.junctionService.addConnectionsFromContact(
	// 			junction,
	// 			coordA.road,
	// 			coordA.contact,
	// 			roadD,
	// 			TvContactPoint.START
	// 		);
	//
	// 	}
	//
	// 	if ( roadC && roadD ) {
	//
	// 		this.junctionService.addConnectionsFromContact(
	// 			junction,
	// 			roadC,
	// 			TvContactPoint.START,
	// 			roadD,
	// 			TvContactPoint.START
	// 		);
	//
	// 	}
	//
	// }

	// createJunction ( splineA: AbstractSpline, splineB: AbstractSpline, point: Vector3 ) {
	//
	// 	if ( splineA == splineB ) return;
	//
	// 	const splineCoordA = this.splineService.getCoordAt( splineA, point );
	// 	const splineCoordB = this.splineService.getCoordAt( splineB, point );
	//
	// 	const segmentA = splineA.segmentMap.findAt( splineCoordA.s );
	// 	const segmentB = splineB.segmentMap.findAt( splineCoordB.s );
	//
	// 	if ( !segmentA ) console.error( 'segmentA is null', splineA, splineCoordA );
	// 	if ( !segmentB ) console.error( 'segmentB is null', splineB, splineCoordB );
	//
	// 	if ( !segmentA || !( segmentA instanceof TvRoad ) ) {
	// 		return
	// 	}
	//
	// 	if ( !segmentB || !( segmentB instanceof TvRoad ) ) {
	// 		return
	// 	}
	//
	// 	const roadA = segmentA;
	// 	const roadB = segmentB;
	//
	// 	if ( !roadA || !roadB ) {
	// 		return;
	// 	}
	//
	// 	const coordA = roadA.getPosThetaByPosition( point ).toRoadCoord( roadA );
	// 	const coordB = roadB.getPosThetaByPosition( point ).toRoadCoord( roadB );
	//
	// 	const junction = this.internal_createIntersectionFromCoords( coordA, coordB );
	//
	// 	return junction;
	//
	// }

	// postProcessJunction ( junction: TvJunction ) {
	//
	// 	this.connectionService.postProcessJunction( junction );
	//
	// }

	// createIntersectionByContact (
	// 	coordA: TvRoadCoord,
	// 	contactA: TvContactPoint,
	// 	coordB: TvRoadCoord,
	// 	contactB: TvContactPoint
	// ): TvJunction {
	//
	// 	// roads should be different
	// 	if ( coordA.road === coordB.road ) {
	//
	// 		const junction = this.junctionService.createNewJunction();
	//
	// 		const coord = coordA.s > coordB.s ? coordA : coordB;
	//
	// 		const roadCCoord = this.cutRoadForJunction( coord, junction );
	//
	// 		this.junctionService.addConnectionsFromContact(
	// 			junction,
	// 			coordA.road,
	// 			TvContactPoint.END,
	// 			roadCCoord.road,
	// 			TvContactPoint.START
	// 		);
	//
	// 		this.postProcessJunction( junction );
	//
	// 		return junction;
	//
	// 	}
	//
	// 	// could be usefull to calculcating if we need
	// 	// to add junction into the roads
	// 	// const distance = coordA.distanceTo( coordB );
	//
	// 	if ( coordA.contactCheck == contactA && coordB.contactCheck == contactB ) {
	//
	// 		const junction = this.junctionService.createNewJunction();
	//
	// 		this.internal_addConnections( junction, coordA, coordB, null, null );
	//
	// 		this.postProcessJunction( junction );
	//
	// 		return junction;
	//
	// 	}
	//
	// }

	// addConnections ( junction: TvJunction, coordA: TvRoadCoord, coordB: TvRoadCoord ) {
	//
	// 	this.junctionService.addConnectionsFromContact(
	// 		junction,
	// 		coordA.road,
	// 		coordA.contact,
	// 		coordB.road,
	// 		coordB.contact
	// 	);
	//
	// }

	// createJunctionFromCoords ( coords: TvRoadCoord[] ): TvJunction {
	//
	// 	const junction = this.junctionFactory.createJunction();
	//
	// 	for ( let i = 0; i < coords.length; i++ ) {
	//
	// 		const coordA = coords[ i ];
	//
	// 		for ( let j = i + 1; j < coords.length; j++ ) {
	//
	// 			const coordB = coords[ j ];
	//
	// 			// roads should be different
	// 			if ( coordA.road === coordB.road ) continue;
	//
	// 			this.addConnections( junction, coordA, coordB );
	//
	// 		}
	//
	// 	}
	//
	// 	this.postProcessJunction( junction );
	//
	// 	return junction;
	// }

	computeJunctionWidth ( group: IntersectionGroup, mainSpline: AbstractSpline ) {

		const junctionCenter = group.getRepresentativePosition();

		const junctionCoord = this.splineService.getCoordAt( mainSpline, junctionCenter )

		// const segment = mainSpline.segmentMap.findAt( junctionCoord.s );

		let maxWidth = JUNCTION_WIDTH;

		const splines = group.getSplines();

		for ( let i = 0; i < splines.length; i++ ) {

			const spline = splines[ i ];

			const posTheta = this.splineService.getCoordAt( spline, junctionCenter );

			const segment = spline.segmentMap.findAt( posTheta.s );

			if ( segment instanceof TvRoad ) {

				const width = segment.getRoadWidthAt( posTheta.s - segment.sStart )?.totalWidth;

				if ( width && width > maxWidth ) {

					maxWidth = width;

				}

			} else if ( segment instanceof TvJunction ) {

				const prev = spline.segmentMap.getPrevious( segment );

				if ( prev instanceof TvRoad ) {

					const width = prev.getRoadWidthAt( posTheta.s - prev.sStart )?.totalWidth;

					if ( width && width > maxWidth ) {

						maxWidth = width;

					}

				}
			}
		}

		return maxWidth;
	}

	// adjustRoadCoordByHeading ( a: TvRoadCoord, b: TvRoadCoord, radius = 50 ) {
	//
	// 	const angleInRadians = Math.abs( a.h - b.h );
	//
	// 	const diff = Math.abs( Math.PI - angleInRadians );
	//
	// 	const desiredDistance = radius * Math.tan( diff / 2 );
	//
	// }

	// adjustJunctionCoords ( coords: TvRoadCoord[], radius = 50 ) {
	//
	// 	for ( let i = 0; i < coords.length; i++ ) {
	//
	// 		const coordA = coords[ i ];
	//
	// 		const nextIndex = i + 1;
	//
	// 		if ( nextIndex >= coords.length ) continue;
	//
	// 		const coordB = coords[ nextIndex ];
	//
	// 		// calculate intersection point
	// 		// const intersectionPoint = Maths.findIntersection( coordA.toPosTheta(), coordB.toPosTheta() );
	//
	// 		const angle = Math.abs( coordA.h - coordB.h );
	//
	// 		const diff = Math.abs( Math.PI - angle );
	//
	// 		const targetDistance = radius * Math.tan( diff / 2 );
	//
	// 		// find target position from intersection point which is further away as per targetDistance
	// 		// const targetPosition = intersectionPoint.clone().add( new Vector3().subVectors( coordA.position, intersectionPoint ).setLength( targetDistance ) );
	// 	}
	// }

	private replaceConnections ( junction: TvJunction, oldRoad: TvRoad, newRoad: TvRoad, contact: TvContactPoint ) {

		for ( const connection of junction.getConnections() ) {

			if ( connection.connectingRoad.predecessor?.element == oldRoad ) {

				connection.connectingRoad.setPredecessorRoad( newRoad, contact );

			}

			if ( connection.connectingRoad.successor?.element == oldRoad ) {

				connection.connectingRoad.setSuccessorRoad( newRoad, contact );

			}

		}

	}

	private adjustCoord ( junction: TvJunction, group: IntersectionGroup, links: TvRoadLink[] ) {

		for ( let i = 0; i < links.length; i++ ) {

			const leftLink = links[ i ];
			const rightLink = links[ ( i + 1 ) % links.length ];

			const leftRoad = leftLink.element as TvRoad;
			const rightRoad = rightLink.element as TvRoad;

			const leftRoadSize = leftRoad.getRoadWidthAt( leftRoad.sStart )
			const rightRoadSize = rightRoad.getRoadWidthAt( rightRoad.sStart );

			// const center = this.computeJunctionCenter( leftLink, rightLink );
			// const center = group.getRepresentativePosition();
			const center = junction.position;

			DebugDrawService.instance.clear();
			DebugDrawService.instance.drawSphere( center, 1.0, COLOR.MAGENTA );

			let distanceFromCenter = Math.max( leftRoadSize.totalWidth, leftRoadSize.totalWidth );

			const angle = this.computeApproachingAngle( leftLink, rightLink, center );

			if ( leftRoad.spline.uuid != rightRoad.spline.uuid ) {

				const diff = Math.abs( Maths.PI2 - angle );

				distanceFromCenter = distanceFromCenter + distanceFromCenter * Math.tan( diff * 0.5 );

			}

			console.debug( 'distanceFromCenter', distanceFromCenter, angle, leftRoad.toString(), rightRoad.toString() )

			const junctionCoord = this.splineService.getCoordAt( rightRoad.spline, center );

			if ( rightLink.contactPoint === TvContactPoint.START ) {

				const splineOffset = junctionCoord.s + distanceFromCenter;

				// If start of road then shift road
				rightRoad.spline.segmentMap.remove( rightRoad );
				rightRoad.spline.segmentMap.set( splineOffset, rightRoad );

				rightRoad.sStart = splineOffset;

			} else if ( rightLink.contactPoint === TvContactPoint.END ) {

				const splineOffset = junctionCoord.s - distanceFromCenter;

				// If end of road then shift junction to right
				rightRoad.spline.segmentMap.remove( junction );
				rightRoad.spline.segmentMap.set( splineOffset, junction );

			}

		}

		for ( let i = 0; i < links.length; i++ ) {

			this.splineBuilder.build( ( links[ i ].element as TvRoad ).spline );

		}

	}

	private angleBetween ( p1: Vector3, center: Vector3, p2: Vector3 ): number {
		const vectorA = new Vector2( p1.x - center.x, p1.y - center.y );
		const vectorB = new Vector2( p2.x - center.x, p2.y - center.y );

		const dotProduct = vectorA.dot( vectorB );
		const magnitudeA = vectorA.length();
		const magnitudeB = vectorB.length();

		const cosTheta = dotProduct / ( magnitudeA * magnitudeB );
		return Math.acos( MathUtils.clamp( cosTheta, -1, 1 ) ); // Ensure the value is within [-1, 1] to avoid NaN
	}

	private computeJunctionCenter ( leftLink: TvRoadLink, rightLink: TvRoadLink ): Vector3 {

		// find center point

		const leftRoad = leftLink.element as TvRoad;
		const rightRoad = rightLink.element as TvRoad;

		const leftRoadSize = leftRoad.getRoadWidthAt( leftRoad.sStart );
		const rightRoadSize = rightRoad.getRoadWidthAt( rightRoad.sStart );

		const leftT = leftLink.contactPoint == TvContactPoint.END ? -1 : 1;
		const rightT = rightLink.contactPoint == TvContactPoint.END ? -1 : 1;

		const leftCenterT = leftRoadSize.leftSideWidth - leftRoadSize.rightSideWidth;
		const rightCenterT = rightRoadSize.leftSideWidth - rightRoadSize.rightSideWidth;

		let leftEntry = this.roadService.findLinkPosition( leftLink ).addLateralOffset( leftCenterT * 0.5 );
		let rightEntry = this.roadService.findLinkPosition( rightLink ).addLateralOffset( rightCenterT * 0.5 );

		if ( leftLink.contactPoint == TvContactPoint.START ) {
			leftEntry = leftEntry.rotateDegree( 180 );
		}

		if ( rightLink.contactPoint == TvContactPoint.START ) {
			rightEntry = rightEntry.rotateDegree( 180 );
		}

		if ( leftRoad.spline.uuid == rightRoad.spline.uuid ) {

			// Calculate the midpoint
			const midpoint = new Vector3(
				( leftEntry.position.x + rightEntry.position.x ) / 2,
				( leftEntry.position.y + rightEntry.position.y ) / 2,
				( leftEntry.position.z + rightEntry.position.z ) / 2
			);

			return midpoint;
		}

		return Maths.findIntersection( leftEntry, rightEntry );

	}

	private computeApproachingAngle ( leftLink: TvRoadLink, rightLink: TvRoadLink, center: Vector3 ) {

		const leftRoad = leftLink.element as TvRoad;
		const rightRoad = rightLink.element as TvRoad;

		const leftRoadSize = leftRoad.getRoadWidthAt( leftRoad.sStart );
		const rightRoadSize = rightRoad.getRoadWidthAt( rightRoad.sStart );

		const leftCenterT = leftRoadSize.leftSideWidth - leftRoadSize.rightSideWidth;
		const rightCenterT = rightRoadSize.leftSideWidth - rightRoadSize.rightSideWidth;

		let leftEntry = this.roadService.findLinkPosition( leftLink ).addLateralOffset( leftCenterT * 0.5 );
		let rightEntry = this.roadService.findLinkPosition( rightLink ).addLateralOffset( rightCenterT * 0.5 );

		return this.angleBetween( leftEntry.position, center, rightEntry.position );
	}


	private computeGroupCentroid ( group: IntersectionGroup ) {

		if ( !group.centroid ) {
			return group.getRepresentativePosition();
		}

		const splines = group.getSplines();

		const points: TvPosTheta[] = [];

		for ( const spline of splines ) {

			const coord = this.splineService.getCoordAt( spline, group.getRepresentativePosition() );

			const segment = spline.segmentMap.findAt( coord.s );

			if ( segment instanceof TvRoad ) {

				const size = segment.getRoadWidthAt( coord.s );

				const t = size.leftSideWidth - size.rightSideWidth;

				const roadMidPosition = this.roadService.findRoadPosition( segment, coord.s, t * 0.5 );
				// const roadLeftPosition = this.roadService.findRoadPosition( segment, coord.s, size.leftSideWidth );
				// const roadRightPosition = this.roadService.findRoadPosition( segment, coord.s, size.rightSideWidth );

				points.push( roadMidPosition );

			}
		}

		const intersections: Vector3[] = [];

		for ( let i = 0; i < points.length; i++ ) {

			const p1 = points[ i ];
			const p2 = points[ ( i + 1 ) % points.length ];

			const intersection = Maths.findIntersection( p1, p2 );

			intersections.push( intersection );

		}

		return GeometryUtils.getCentroid( intersections );

	}
}

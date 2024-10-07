/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoad } from "app/map/models/tv-road.model";
import { MapService } from "app/services/map/map.service";
import { SplineGeometryGenerator } from "app/services/spline/spline-geometry-generator";
import { RoadManager } from "./road/road-manager";
import { RoadService } from "app/services/road/road.service";
import { JunctionFactory } from "app/factories/junction.factory";
import { AbstractSpline, NewSegment, SplineType } from "../core/shapes/abstract-spline";
import { SplineIntersection } from 'app/services/junction/spline-intersection';
import { IntersectionGroup } from "./Intersection-group";
import { TvContactPoint } from "../map/models/tv-common";
import { TvLink, TvLinkType } from "../map/models/tv-link";
import { LinkFactory } from 'app/map/models/link-factory';
import { JunctionService } from "../services/junction/junction.service";
import { Maths } from "app/utils/maths";
import { RoadUtils } from "../utils/road.utils";
import { Vector2, Vector3 } from "three";
import { Log } from "app/core/utils/log";
import { TvJunctionBoundaryService } from "../map/junction-boundary/tv-junction-boundary.service";
import { SplineUtils } from "app/utils/spline.utils";
import { OrderedMap } from "app/core/models/ordered-map";
import { SplineFixerService } from "app/services/spline/spline.fixer";
import { JunctionRoadService } from "app/services/junction/junction-road.service";
import { ConnectionManager } from "../map/junction/connection.manager";
import { SplineIntersectionService } from "app/services/spline/spline-intersection.service";
import { MapEvents } from "app/events/map-events";
import { GeometryUtils } from "app/services/surface/geometry-utils";
import { createGroupsFromIntersections } from "./intersection-group-helper";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionManager {

	private debug = true;

	constructor (
		public mapService: MapService,
		public roadManager: RoadManager,
		public roadService: RoadService,
		public junctionFactory: JunctionFactory,
		public junctionService: JunctionService,
		public junctionRoadService: JunctionRoadService,
		public boundaryService: TvJunctionBoundaryService,
		public splineFixer: SplineFixerService,
		public connectionManager: ConnectionManager,
		public intersectionService: SplineIntersectionService,
	) {
	}

	addJunction ( junction: TvJunction ) {

		if ( this.debug ) Log.debug( 'Add', junction.toString() );

		this.mapService.map.addJunction( junction );

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			// TODO: use road manager
			if ( !this.mapService.map.roads.includes( connection.connectingRoad ) ) {

				this.roadService.add( connection.connectingRoad );

			} else {

				this.roadManager.updateRoad( connection.connectingRoad );

			}

		}

		this.junctionRoadService.linkRoads( junction );

		this.boundaryService.update( junction );

		MapEvents.makeMesh.emit( junction );

		junction.updatePositionAndBounds();

	}

	updateJunction ( junction: TvJunction, otherSplines: AbstractSpline[] = [] ) {

		if ( this.debug ) Log.debug( 'Update', junction.toString() );

		junction.needsUpdate = false;

		const links = [];

		otherSplines.forEach( s => links.push( ...this.getJunctionLinks( s, junction ) ) );

		this.connectionManager.generateConnections( junction, links );

		// temporary fix for junctions
		this.mapService.map.removeJunction( junction );

		MapEvents.removeMesh.emit( junction );

		this.addJunction( junction );

	}

	detectJunctions ( spline: AbstractSpline ): void {

		if ( this.debug ) Log.debug( 'DetectJunctions', spline.toString() );

		if ( spline.isConnectingRoad() ) return;

		if ( spline.type == SplineType.EXPLICIT ) return;

		const oldJunctions = spline.getJunctionSegments();

		const intersections = this.intersectionService.findIntersections( spline );

		const result = this.categorizeJunctions( oldJunctions, intersections );

		for ( const junction of result.junctionsToRemove ) {

			// NOTE: to avoid removing same junction twice
			if ( result.junctionsToUpdate.includes( junction ) ) {
				continue;
			}

			this.removeJunction( junction, spline, true );

		}

		for ( const junction of result.junctionsToUpdate ) {

			this.removeJunction( junction, spline );

		}

		const groups = this.createGroups( intersections );

		for ( const group of groups ) {

			try {

				this.createCoordAndAddLinksAndJunction( group );

			} catch ( e ) {

				Log.error( 'Error Creating Junction', e );

			}

		}
	}

	addLink ( junction: TvJunction, road: TvRoad, contact: TvContactPoint ) {

		this.connectionManager.addConnectionsForRoad( junction, road, contact );

		this.mapService.removeJunction( junction );

		this.addJunction( junction );

	}

	removeJunction ( junction: TvJunction, spline?: AbstractSpline, processOthers = false ): void {

		if ( this.debug ) Log.debug( 'Remove', junction.toString() );

		const incomingSplines = junction.getIncomingSplines();

		this.junctionRoadService.removeLinks( junction );

		for ( const incomingSpline of incomingSplines ) {

			this.removeJunctionSegment( junction, incomingSpline );

			SplineUtils.updateInternalLinks( incomingSpline );

		}

		this.junctionRoadService.removeAll( junction );

		this.mapService.map.removeJunction( junction );

		MapEvents.removeMesh.emit( junction );

		// TODO: we should check the remaing spline count instead of initial
		if ( incomingSplines.length > 2 && spline && processOthers ) {

			const otherSplines = incomingSplines.filter( s => s != spline );

			const intersections = this.intersectionService.findIntersections( otherSplines[ 0 ], otherSplines );

			const groups = this.createGroups( intersections );

			for ( const group of groups ) {

				this.createCoordAndAddLinksAndJunction( group );

			}

		}

	}

	removeJunctionSegment ( junction: TvJunction, incomingSpline: AbstractSpline ): void {

		// if junction is not auto then we should not remove the segment
		if ( !junction.auto ) return;

		const prev = incomingSpline.segmentMap.getPrevious( junction );
		const next = incomingSpline.segmentMap.getNext( junction );

		if ( prev instanceof TvRoad ) {
			prev.successor = null;
		}

		if ( next instanceof TvRoad ) {
			next.predecessor = null;
		}

		if ( SplineUtils.hasSegment( incomingSpline, junction ) ) {
			SplineUtils.removeSegment( incomingSpline, junction );
		} else {
			Log.warn( 'Segment not found in spline', junction.toString(), incomingSpline?.toString() );
		}

		this.splineFixer.setInternalLinks( incomingSpline );

		incomingSpline.updateSegmentGeometryAndBounds();

	}

	/**
	 * This method converts a junction into intersections
	 *
	 * @param junction
	 * @returns
	 */
	getJunctionIntersections ( junction: TvJunction ): SplineIntersection[] {

		const intersections: SplineIntersection[] = [];

		const splines = junction.getIncomingSplines();

		for ( let i = 0; i < splines.length; i++ ) {

			const spline = splines[ i ];

			// Start the inner loop from the next spline to avoid duplicate pairs and self-comparison.
			for ( let j = i + 1; j < splines.length; j++ ) {

				const otherSpline = splines[ j ];

				// Find intersections between the current spline and the other spline and add them to the list.
				this.intersectionService.findIntersections( spline, [ otherSpline ] ).forEach( intersection => {

					intersections.push( intersection );

				} );

			}

		}

		return intersections;
	}

	/**
	 * Returns true if intersections match with junction splines
	 *
	 * @param junction
	 * @param intersections
	 */
	isJunctionMatchingIntersections ( junction: TvJunction, intersections: SplineIntersection[] ): boolean {

		const junctionSplines = junction.getIncomingSplines();

		const junctionUuids = junctionSplines.map( s => s.uuid );

		const splineUuids = intersections.map( i => i.spline.uuid ).concat( intersections.map( i => i.otherSpline.uuid ) );

		const common = splineUuids.filter( value => junctionUuids.includes( value ) );

		for ( const intersection of intersections ) {
			if ( junction.containsPoint( intersection.position ) ) {
				return true;
			}
		}

		if ( common.length == junctionSplines.length ) {

			// if all splines are same, it is old junction
			return true;

		} else {

			// if any spline is different, it is new junction
			return false;

		}

	}

	findNewIntersections ( spline: AbstractSpline ) {

		const junctions = spline.getJunctionSegments();

		const intersections = this.intersectionService.findIntersections( spline );

		if ( junctions.length == 0 ) return intersections;

		const newIntersections: SplineIntersection[] = [];

		for ( const junction of junctions ) {

			if ( this.isJunctionMatchingIntersections( junction, intersections ) ) {

				continue;

			} else {

				intersections.forEach( i => newIntersections.push( i ) );

			}

		}

		return newIntersections;
	}

	removeConnections ( junction: TvJunction, incomingRoad: TvRoad ) {

		this.connectionManager.removeConnectionAndRoads( junction, incomingRoad );

	}

	createNewRoad ( spline: AbstractSpline, startOffset: number ) {

		const firstRoad = spline.getRoadSegments()[ 0 ];

		const newRoad = this.roadService.clone( firstRoad, 0 );

		newRoad.sStart = startOffset;

		this.mapService.map.addRoad( newRoad );

		newRoad.successor = newRoad.predecessor = null;

		return newRoad;

	}

	// eslint-disable-next-line max-lines-per-function
	insertJunction ( spline: AbstractSpline, junctionStart: number, junctionEnd: number, newJunction: TvJunction ) {

		const temp = new OrderedMap<NewSegment>();

		let inserted = false;

		let segments = Array.from( spline.segmentMap.entries() );

		for ( let i = 0; i < segments.length; i++ ) {

			let [ currentOffset, currentSegment ] = segments[ i ];

			const isJunction = currentSegment instanceof TvJunction;
			const isRoad = currentSegment instanceof TvRoad;

			const nextOffset = ( i < segments.length - 1 ) ? segments[ i + 1 ][ 0 ] : spline.getLength();
			const previousSegment = ( i > 0 ) ? segments[ i - 1 ][ 1 ] : null;

			if ( !inserted && junctionStart <= currentOffset ) {

				temp.set( junctionStart, newJunction );

				inserted = true;

				// Create a new road after the junction if needed
				if ( isJunction && junctionEnd < currentOffset ) {

					// we need to disconnect the previous road with current segment junction
					if ( previousSegment instanceof TvRoad && currentSegment instanceof TvJunction ) {

						this.removeConnections( currentSegment, previousSegment );

						this.junctionRoadService.removeLink( currentSegment, previousSegment );

						currentSegment.needsUpdate = true;

					}

					// also for new road we need to add connections
					// which will be automatically added in next step
					temp.set( junctionEnd, this.createNewRoad( spline, junctionEnd ) );

				}


				if ( isRoad && junctionEnd < currentOffset ) {

					// we need to update road at junction end
					temp.set( junctionEnd, currentSegment );

					continue;
				}

				// If the junction entirely covers this segment, skip it
				if ( isRoad && junctionEnd >= nextOffset ) {

					if ( currentSegment instanceof TvRoad ) {

						this.roadManager.removeRoad( currentSegment );

					} else {

						throw new Error( 'Segment is junction' );

					}

					continue;

				}

			}

			// Adjust the current segment if it's partially overlapped by the junction
			if ( inserted && currentOffset < junctionEnd ) {
				currentOffset = junctionEnd;
			}

			// Add the current segment if it's not entirely overlapped by the junction
			if ( currentOffset < nextOffset ) {
				temp.set( currentOffset, currentSegment );
			}
		}

		// If the junction wasn't inserted (i.e., it goes at the end), insert it now
		if ( !inserted ) {

			temp.set( junctionStart, newJunction );

			// Create a new road after the junction if needed
			if ( junctionEnd < spline.getLength() ) {

				const previousKey = temp.getPeviousKey( newJunction );

				const previousSegment = temp.getPrevious( newJunction );

				const successor = spline.getSuccessor();

				// we need to disconnect the previous road with current segment junction
				if ( previousSegment instanceof TvRoad && successor instanceof TvJunction ) {

					successor.needsUpdate = true;

					const newRoad = this.createNewRoad( spline, junctionEnd );

					// new segmetn will be shiflted left
					temp.set( previousKey, newRoad );

					// and previous segment will be shifted right
					temp.set( junctionEnd, previousSegment );

					// swap the connection if previous segment predecessor is junction
					previousSegment.predecessor?.replace( previousSegment, newRoad, TvContactPoint.START );

				} else {

					const newRoad = this.createNewRoad( spline, junctionEnd );

					temp.set( junctionEnd, newRoad );

					// not setting the successor is leading to
					// unconnected roads
					spline.getSuccessorLink()?.setSuccessor( newRoad );

				}

			}

		}

		spline.segmentMap.forEach( ( segment, sOffset ) => {
			if ( !temp.contains( segment ) ) {
				Log.error( 'Segment removed ' + segment.toString() );
			}
		} );

		spline.segmentMap.clear();

		temp.forEach( ( segment, sOffset ) => {

			SplineUtils.addSegment( spline, sOffset, segment );

		} );

	}

	updateSplineInternalLinks ( spline: AbstractSpline, setNull = true ) {

		this.splineFixer.setInternalLinks( spline );

	}

	getJunctionLinks ( spline: AbstractSpline, junction: TvJunction, coords?: TvLink[] ): TvLink[] {

		coords = coords || [];

		const prev = spline.getPreviousSegment( junction );
		const next = spline.getNextSegment( junction );

		if ( prev instanceof TvRoad ) {
			coords.push( LinkFactory.createRoadLink( prev, TvContactPoint.END ) );
		}

		if ( next instanceof TvRoad ) {
			coords.push( LinkFactory.createRoadLink( next, TvContactPoint.START ) );
		}

		return coords;
	}

	updateConnections ( junction: TvJunction ) {

		// we will regenerate splines for each connecting road
		// no other modification is needed

		this.connectionManager.updateGeometries( junction );

		this.junctionService.updateJunctionMeshAndBoundary( junction );

	}

	createGroups ( intersections: SplineIntersection[], thresholdDistance = 10 ): IntersectionGroup[] {

		return createGroupsFromIntersections( intersections, thresholdDistance );

	}

	// eslint-disable-next-line max-lines-per-function
	categorizeJunctions ( junctions: TvJunction[], intersections: SplineIntersection[] ): {
		junctionsToCreate: SplineIntersection[],
		junctionsToUpdate: TvJunction[],
		junctionsToRemove: TvJunction[]
	} {
		const junctionsToCreate: SplineIntersection[] = [];
		const junctionsToUpdate = new Set<TvJunction>();
		const junctionsToRemove = new Set<TvJunction>();

		junctions.forEach( junction => junctionsToRemove.add( junction ) );

		for ( const intersection of intersections ) {

			let matchFound = false;

			for ( const junction of junctions ) {

				if ( junction.getKey().includes( intersection.getKey() ) || junction.containsPoint( intersection.position ) ) {

					junctionsToUpdate.add( junction );

					if ( junctionsToRemove.has( junction ) ) {
						junctionsToRemove.delete( junction );
					}

					matchFound = true;

					break;

				}

			}

			const neardByJunction = this.getNearestJunction( intersection.position );

			if ( neardByJunction ) {
				junctionsToUpdate.add( neardByJunction );
				matchFound = true;
			}

			if ( !matchFound ) {
				junctionsToCreate.push( intersection );
			}
		}

		return {
			junctionsToCreate,
			junctionsToUpdate: [ ...junctionsToUpdate ],
			junctionsToRemove: [ ...junctionsToRemove ]
		};
	}

	createCoordAndAddLinksAndJunction ( group: IntersectionGroup ): void {

		const junction = this.createOrGetJunctionFromGroup( group );

		if ( !junction ) {
			Log.error( 'createJunctionFromGroup: Junction not created', group.toString() );
			return;
		}

		const links: TvLink[] = this.getRoadLinkFromCoords( group, junction );

		this.addConnectionsFromLinks( junction, links );

		if ( this.mapService.hasJunction( junction ) ) {

			this.mapService.removeJunction( junction );

			this.addJunction( junction );

		} else {

			this.addJunction( junction );

		}
	}

	addConnectionsFromLinks ( junction: TvJunction, links: TvLink[] ): void {

		this.connectionManager.addConnectionsFromLinks( junction, links );

	}

	private createOrGetJunctionFromGroup ( group: IntersectionGroup ): TvJunction {

		return this.junctionFactory.createOrGetJunctionFromGroup( group );

	}

	private getRoadLinkFromCoords ( group: IntersectionGroup, junction: TvJunction ): TvLink[] {

		const coords: TvLink[] = [];

		const splines = this.addJunctionInGroupSplines( group, junction );

		splines.forEach( spline => {

			this.updateSplineInternalLinks( spline );

			coords.push( ...this.getJunctionLinks( spline, junction ) );

			spline.updateSegmentGeometryAndBounds();

		} );

		const junctions = this.getJunctionsWithIncomingSplines( splines );

		junctions.forEach( ( incomingSplines, junction ) => {

			this.updateJunction( junction, [ ...incomingSplines ] );

		} );

		return this.sortLinks( coords );

	}

	private addJunctionInGroupSplines ( group: IntersectionGroup, junction: TvJunction ): AbstractSpline[] {

		const splines = new Set<AbstractSpline>();

		group.getIntersections().forEach( i => {

			if ( !splines.has( i.spline ) ) {

				this.insertJunction( i.spline, i.splineStart, i.splineEnd, junction );

				i.spline.updateSegmentGeometryAndBounds();

				splines.add( i.spline );

			}

			if ( !splines.has( i.otherSpline ) ) {

				this.insertJunction( i.otherSpline, i.otherStart, i.otherEnd, junction );

				i.otherSpline.updateSegmentGeometryAndBounds();

				splines.add( i.otherSpline );

			}

		} );

		return [ ...splines ];

	}

	private getJunctionsWithIncomingSplines ( splines: AbstractSpline[] ): Map<TvJunction, Set<AbstractSpline>> {

		const junctions = new Map<TvJunction, Set<AbstractSpline>>();

		splines.forEach( spline => {

			spline.getSegments().forEach( segment => {

				if ( segment instanceof TvJunction && segment.needsUpdate ) {

					if ( !junctions.has( segment ) ) {

						junctions.set( segment, new Set<AbstractSpline>( [] ) );

					}

					junctions.get( segment ).add( spline );

					const incomingSplines = segment.getIncomingSplines();

					incomingSplines.forEach( inSpline => junctions.get( segment ).add( inSpline ) );

				}

			} );

			const predecessor = spline.getPredecessor();
			const successor = spline.getSuccessor();

			if ( predecessor instanceof TvJunction && !predecessor.auto ) {
				Log.error( 'Predecessor is not a road' );
			}

			if ( successor instanceof TvJunction && !successor.auto ) {
				Log.error( 'Successor is not a road' );
			}

		} );

		return junctions;

	}

	sortLinks ( links: TvLink[] ): TvLink[] {

		return GeometryUtils.sortRoadLinks( links );

	}

	addJunctionCoords ( spline: AbstractSpline, links: TvLink[], junction: TvJunction ) {

		Log.warn( 'addJunctionCoords', junction?.toString(), spline.segmentMap );

		const previousSegment = spline.segmentMap.getPrevious( junction );

		if ( previousSegment instanceof TvRoad ) {

			links.push( LinkFactory.createRoadLink( previousSegment, TvContactPoint.END ) );

		} else {

			Log.warn( 'Previous Segment is not a Road', previousSegment?.toString() );

		}

		const nextSegment = spline.segmentMap.getNext( junction );

		if ( nextSegment instanceof TvRoad ) {

			links.push( LinkFactory.createRoadLink( nextSegment, TvContactPoint.START ) );

		} else if ( nextSegment instanceof TvJunction ) {

			Log.warn( 'Next Segment Junction', nextSegment?.toString() );

			// const nextLinks = nextSegment.getLinks();

			// nextLinks.forEach( link => {

			// 	if ( links.find( l => l.matches( link ) ) ) return;

			// 	links.push( link );

			// } );

		} else {

			// const junctionLinks = junction.getLinks();

			// junctionLinks.forEach( link => {

			// 	if ( links.find( l => l.matches( link ) ) ) return;

			// 	links.push( link );

			// } );

			Log.warn( 'Next Segment NULL' );

		}

	}

	handleEdgeJunction ( spline: AbstractSpline, junction: TvJunction, coords: TvLink[], sStart: number, sEnd: number, startSegment: TvRoad, mainRoad: TvRoad, junctionWidth: number ) {

		if ( !mainRoad ) {
			Log.error( 'Main Road is NULL' );
			return;
		}

		const splineLength = spline.getLength();

		const hasPredecessor = startSegment.predecessor != null;

		const hasSuccessor = mainRoad.successor != null;

		const isNearStart = sStart <= 0;

		const isNearEnd = sEnd >= splineLength;

		if ( isNearEnd ) {

			Log.debug( 'adding end segment coords', mainRoad.toString() );

			this.handleJunctionAtEnd( spline, junction, coords, sStart, mainRoad );

			if ( hasSuccessor ) {

				Log.warn( 'hasSuccessor', mainRoad.toString() );

				const nextLink = mainRoad.successor?.clone();

				if ( nextLink.element instanceof TvRoad ) {

					RoadUtils.unlinkSuccessor( mainRoad );
					RoadUtils.unlinkPredecessor( nextLink.element );

					coords.push( LinkFactory.createRoadLink( nextLink.element, nextLink.contactPoint ) );

				} else {

					Log.warn( 'nextLink is not a road', nextLink?.toString() );

				}

			}

			mainRoad.successor = LinkFactory.createJunctionLink( junction );

		} else if ( isNearStart ) {

			Log.debug( 'adding start segment coords', startSegment?.toString() );

			if ( hasPredecessor ) {

				Log.debug( 'hasPredecessor', startSegment?.toString() );

				this.handleJunctionAtStart( spline, junction, coords, junctionWidth );

			} else {

				this.handleJunctionAtStart( spline, junction, coords, junctionWidth );

			}

		} else {

			throw new Error( 'Invalid start/end segment' );

		}
	}

	handleJunctionAtEnd ( spline: AbstractSpline, junction: TvJunction, coords: TvLink[], sStartJunction: number, road: TvRoad ) {

		// SplineUtils.removeSegment( spline, junction );
		SplineUtils.addSegment( spline, sStartJunction, junction );

		this.rebuildRoad( road );

		coords.push( LinkFactory.createRoadLink( road, TvContactPoint.END ) );

	}

	handleJunctionAtStart ( spline: AbstractSpline, junction: TvJunction, coords: TvLink[], junctionWidth: number ) {

		const road = spline.getRoadSegments()[ 0 ];

		SplineUtils.removeSegment( spline, road );

		SplineUtils.addSegment( spline, 0, junction );
		SplineUtils.addSegment( spline, junctionWidth, road );

		road.setPredecessor( TvLinkType.JUNCTION, junction );

		this.rebuildRoad( road );

		coords.push( LinkFactory.createRoadLink( road, TvContactPoint.START ) );

	}

	handleJunctionInMiddle ( spline: AbstractSpline, junction: TvJunction, sStart: number, sEnd: number ): TvLink[] {

		const segment = spline.segmentMap.findAt( sStart );

		if ( segment instanceof TvRoad ) {

			const newRoad = this.createNewRoadSegment( spline, segment, junction, sStart, sEnd );

			Log.debug( 'created new segment', newRoad.toString(), 'From', segment.toString(), 'For', junction.toString(), sStart, sEnd );

			return [
				LinkFactory.createRoadLink( segment, TvContactPoint.END ),
				LinkFactory.createRoadLink( newRoad, TvContactPoint.START )
			];

		} else if ( segment instanceof TvJunction ) {

			Log.debug( 'Middle segment is junction', segment.toString(), spline.toString() );

			const prev = spline.segmentMap.getPrevious( segment );
			const next = spline.segmentMap.getNext( segment );

			return [
				LinkFactory.createLink( TvLinkType.ROAD, prev, TvContactPoint.END ),
				LinkFactory.createLink( TvLinkType.ROAD, next, TvContactPoint.START )
			];

		} else {

			throw new Error( 'Invalid segment' );

		}


	}

	createNewRoadSegment ( spline: AbstractSpline, existingRoad: TvRoad, junction: TvJunction, sStart: number, sEnd: number ): TvRoad {

		const newRoad = this.roadService.clone( existingRoad, sStart );

		newRoad.sStart = sEnd;

		spline.addSegment( sEnd, newRoad );

		existingRoad.successor?.replace( existingRoad, newRoad, TvContactPoint.END );

		newRoad.setPredecessor( TvLinkType.JUNCTION, junction );

		existingRoad.setSuccessor( TvLinkType.JUNCTION, junction );

		this.mapService.map.addRoad( newRoad );

		spline.addSegment( sStart, junction );

		spline.updateSegmentGeometryAndBounds();

		return newRoad;

	}

	rebuildRoad ( road: TvRoad ): void {

		road.spline.updateSegmentGeometryAndBounds();

	}

	getNearestJunction ( point: Vector3 ): TvJunction | undefined {

		return this.junctionService.getNearestJunction( point );

	}

}

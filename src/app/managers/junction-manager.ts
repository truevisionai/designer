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

		otherSplines.forEach( s => links.push( ...s.getSegmentLinks( junction ) ) );

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

		}

		this.junctionRoadService.removeAll( junction );

		this.mapService.removeJunction( junction );

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

	removeJunctionSegment ( junction: TvJunction, spline: AbstractSpline ): void {

		// if junction is not auto then we should not remove the segment
		if ( !junction.auto ) return;

		spline.removeSegmentAndReplaceLinks( junction );

	}

	/**
	 * This method converts a junction into intersections
	 *
	 * @param junction
	 * @returns
	 */
	getJunctionIntersections ( junction: TvJunction ): SplineIntersection[] {

		return junction.getSplineIntersections();

	}

	/**
	 * Returns true if intersections match with junction splines
	 *
	 * @param junction
	 * @param intersections
	 */
	isJunctionMatchingIntersections ( junction: TvJunction, intersections: SplineIntersection[] ): boolean {

		const intersectionKeys = intersections.map( i => i.getKey() );

		const common = intersectionKeys.filter( value => junction.getKey().includes( value ) );

		for ( const intersection of intersections ) {
			if ( junction.containsPoint( intersection.position ) ) {
				return true;
			}
		}

		if ( common.length == intersectionKeys.length ) {

			// if all splines are same, it is old junction
			return true;

		} else {

			// if any spline is different, it is new junction
			return false;

		}

	}

	/**
	 *
	 * @param spline
	 * @returns
	 * @deprecated not being used anywhere except tests
	 */
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

			spline.updateLinks();

			coords.push( ...spline.getSegmentLinks( junction ) );

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

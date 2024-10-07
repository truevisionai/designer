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

		// const junctionLinks: TvRoadLink[] = [];

		// const junctionSplines = new Set<AbstractSpline>();

		// // TODO: we can also find all the splines which are found in junction boundary
		// junction.getIncomingSplines();

		// otherSplines.forEach( spline => junctionSplines.add( spline ) );

		// junctionSplines.forEach( spline => {

		// 	this.updateSplineInternalLinks( spline, false );

		// 	this.findLinksForJunction( spline, junction, junctionLinks );

		// } );

		// this.connectionManager.removeAllConnections( junction );

		// this.createConnections( junction, this.sortLinks( junctionLinks ) );

		const links = [];

		otherSplines.forEach( s => links.push( ...this.getJunctionLinks( s, junction ) ) );

		this.connectionManager.generateConnections( junction, links );

		// temporary fix for junctions
		this.mapService.map.removeJunction( junction );

		MapEvents.removeMesh.emit( junction );

		this.addJunction( junction );

	}

	handleSplineAdded ( spline: AbstractSpline ): void {

		if ( spline.isConnectingRoad() ) {

			const connectionRoad = spline.getFirstSegment() as TvRoad;

			const junction = connectionRoad.junction;

			const connection = junction.getConnections().find( c => c.connectingRoad == connectionRoad );

			this.connectionManager.buildConnectionGeometry( junction, connection );

			this.junctionService.updateJunctionMeshAndBoundary( junction );

		} else {

			this.detectJunctions( spline );

		}

	}

	handleSplineUpdated ( spline: AbstractSpline ): void {

		if ( spline.isConnectingRoad() ) {

			const connectionRoad = spline.getFirstSegment() as TvRoad;

			const junction = connectionRoad.junction;

			const connection = junction.getConnections().find( c => c.connectingRoad == connectionRoad );

			this.connectionManager.buildConnectionGeometry( junction, connection );

			this.junctionService.updateJunctionMeshAndBoundary( junction );

		} else {

			this.detectJunctions( spline );

		}

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

				this.createJunctionFromGroup( group );

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

				this.createJunctionFromGroup( group );

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

	// updateSegmentSections ( junction: TvJunction, intersections: SplineIntersection[] ) {
	//
	// 	const junctionArea = new Box2();
	//
	// 	const computeOffsets = ( spline: AbstractSpline ) => {
	//
	// 		const BUFFER = 2;
	//
	// 		const corners = [
	// 			new Vector3( junctionArea.min.x, junctionArea.min.y, 0 ),
	// 			new Vector3( junctionArea.max.x, junctionArea.min.y, 0 ),
	// 			new Vector3( junctionArea.max.x, junctionArea.max.y, 0 ),
	// 			new Vector3( junctionArea.min.x, junctionArea.max.y, 0 )
	// 		];
	//
	// 		const splineACoords = corners.map( corner => this.splineService.getCoordAt( spline, corner ) ).sort( ( a, b ) => a.s - b.s );
	//
	// 		const aMin = splineACoords[ 0 ];
	// 		const aMax = splineACoords[ splineACoords.length - 1 ];
	//
	// 		let splineStart = Math.max( aMin.s - BUFFER, 0 );
	// 		let splineEnd = Math.min( aMax.s + BUFFER, spline.getLength() );
	//
	// 		// TEMP: hack to fix the offset issue at ends
	//
	// 		if ( splineStart == 0 ) {
	// 			splineEnd += 5;
	// 		}
	//
	// 		if ( splineEnd == spline.getLength() ) {
	// 			splineStart -= 5;
	// 		}
	//
	// 		return { splineStart, splineEnd };
	// 	}
	//
	// 	intersections.forEach( intersection => junctionArea.union( intersection.area ) );
	//
	// 	const splines = new Set<AbstractSpline>();
	//
	// 	intersections.forEach( intersection => {
	// 		splines.add( intersection.spline );
	// 		splines.add( intersection.otherSpline );
	// 	} );
	//
	// 	splines.forEach( spline => {
	//
	// 		const { splineStart, splineEnd } = computeOffsets( spline );
	//
	// 		if ( SplineUtils.hasSegment( spline, junction ) ) {
	// 			SplineUtils.removeSegment( spline, junction );
	// 		}
	//
	// 		SplineUtils.addSegment( spline, splineStart, junction );
	//
	// 		const next = spline.segmentMap.getNext( junction );
	//
	// 		if ( next ) {
	// 			SplineUtils.removeSegment( spline, next );
	// 			SplineUtils.addSegment( spline, splineEnd, next );
	// 		}
	//
	// 	} );
	//
	// 	splines.forEach( spline => this.splineBuilder.build( spline ) );
	//
	// 	this.removeAllConnections( junction );
	//
	// 	const links = [];
	//
	// 	splines.forEach( s => links.push( ...this.findRoadLinks( s, junction ) ) );
	//
	// 	const sorted = this.sortLinks( links );
	//
	// 	this.createConnections( junction, sorted );
	//
	// 	this.clearInvalidLaneLinks( junction );
	//
	// }

	// clearInvalidLaneLinks ( junction: TvJunction ) {
	//
	// 	// we want to remove non-carriage way links
	// 	// if we have driving lanes intersecting with
	// 	const links = JunctionUtils.getLaneLinks( junction );
	//
	// 	const drivingLinks = links.filter( link => link.connectingLane.type === TvLaneType.driving );
	//
	// 	const nonDrivingLinks = links.filter( link => link.connectingLane.type !== TvLaneType.driving );
	//
	// 	const removedLinks = new Set<TvJunctionLaneLink>();
	//
	// 	for ( const drivingLink of drivingLinks ) {
	//
	// 		for ( const nonDrivingLink of nonDrivingLinks ) {
	//
	// 			if ( removedLinks.has( nonDrivingLink ) ) continue
	//
	// 			const drivingConnnection = JunctionUtils.findConnectionFromLink( junction, drivingLink );
	// 			const nonDrivingConnection = JunctionUtils.findConnectionFromLink( junction, nonDrivingLink );
	//
	// 			if ( !drivingConnnection ) {
	// 				Log.error( 'Driving Connection not found' );
	// 				continue;
	// 			}
	//
	// 			if ( !nonDrivingConnection ) {
	// 				Log.error( 'Sidewalk Connection not found' );
	// 				continue;
	// 			}
	//
	// 			const intersect = this.splineService.findIntersection(
	// 				drivingConnnection.connectingRoad.spline,
	// 				nonDrivingConnection.connectingRoad.spline
	// 			);
	//
	// 			if ( intersect ) {
	//
	// 				this.roadManager.removeRoad( nonDrivingConnection.connectingRoad );
	//
	// 				junction.removeConnection( nonDrivingConnection );
	//
	// 				removedLinks.add( nonDrivingLink );
	//
	// 			}
	//
	// 		}
	//
	// 	}
	//
	// }

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

	mergeGroups ( groups: IntersectionGroup[] ) {

		for ( const group of groups ) {

			this.mergeGroup( group );

		}

	}

	mergeGroup ( group: IntersectionGroup ) {

		const splines = group.getSplines();

		for ( const spline of splines ) {

			spline.segmentMap.forEach( segment => {

				if ( segment instanceof TvJunction ) {

					// this.junctionGeometryService.updateBoundingBox( segment );

					// const boundingBox = segment.depBoundingBox || this.junctionService.computeBoundingBox( segment );

					const groupPosition = new Vector2( group.centroid.x, group.centroid.y );

					const distance = segment.distanceToPoint( groupPosition );

					if ( distance < 10 ) {

						if ( this.debug ) Log.debug( 'Merging Junction Into Group', segment.toString() );

						const incomingSplines = segment.getIncomingSplines();

						incomingSplines.forEach( incomingSpline => {

							const i = new SplineIntersection( incomingSpline, spline, group.getRepresentativePosition() );

							group.addSplineIntersection( i );

						} );

						this.removeJunction( segment );

					}

				}

			} );

		}
	}

	updateConnections ( junction: TvJunction ) {

		// we will regenerate splines for each connecting road
		// no other modification is needed

		this.connectionManager.updateGeometries( junction );

		this.junctionService.updateJunctionMeshAndBoundary( junction );

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

			this.reComputeJunctionOffsets( group );

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

					this.reComputeJunctionOffsets( group );

					j--;

				}

			}

		}

		return groups;
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

			const neardByJunction = this.findNearestJunction( intersection.position );

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

	reComputeJunctionOffsets ( group: IntersectionGroup, force = false ) {

		if ( !force && group.getSplines().length < 2 ) return;

		// if group has more than 2 spline we should recalculate junctions regions
		// for each of them to update their start/end positions
		const splines = group.getSplines();

		for ( let a = 0; a < splines.length; a++ ) {

			const spline = splines[ a ];

			for ( let b = a + 1; b < splines.length; b++ ) {

				const element = splines[ b ];

				const intersections = spline.getIntersections( element );

				intersections.forEach( i => group.addSplineIntersection( i ) );

			}

		}

		// group.getSplines().forEach( spline => {

		// const offset = group.getOffset( spline );

		// this.createRoadCoordNew( spline, offset.sStart, offset.sEnd, junction, group ).forEach( c => coords.push( c ) );

		// this.splineBuilder.buildGeometry( spline );

		// } );

		// DebugDrawService.instance.drawBox2D( group.area, COLOR.WHITE );

	}

	createJunctionFromGroup ( group: IntersectionGroup ): void {

		const junction = this.createGroupJunction( group );

		if ( !junction ) {
			Log.error( 'createJunctionFromGroup: Junction not created', group.toString() );
			return;
		}

		const links: TvLink[] = this.createGroupCoords( group, junction );

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

	createGroupJunction ( group: IntersectionGroup ): TvJunction {

		const junctions = new Set<TvJunction>();

		const splines = group.getSplines();

		splines.forEach( spline => spline.getJunctionSegments().forEach( junction => {

			const groupPosition = new Vector2( group.centroid.x, group.centroid.y )

			// const bbox = junction.depBoundingBox || this.junctionService.computeBoundingBox( junction );

			if ( junction.distanceToPoint( groupPosition ) < 10 ) {

				junctions.add( junction )

			}

		} ) );

		if ( junctions.size == 0 ) {

			return this.junctionFactory.createAutoJunction( group.getRepresentativePosition() );

		}

		if ( junctions.size == 1 ) {

			return junctions.values().next().value;

		}

		Log.error( 'Multiple junctions found in group' );

	}

	private createGroupCoords ( group: IntersectionGroup, junction: TvJunction ): TvLink[] {

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

	createRoadCoordNew ( spline: AbstractSpline, sStart: number, sEnd: number, junction: TvJunction, group: IntersectionGroup ): TvLink[] {

		// Clamp the start and end values
		sStart = Maths.clamp( sStart, 0, spline.getLength() );
		sEnd = Maths.clamp( sEnd, 0, spline.getLength() );

		const startSegment = spline.segmentMap.findAt( sStart );
		const endSegment = spline.segmentMap.findAt( sEnd );

		const junctionWidth = Math.abs( sEnd - sStart );

		const links: TvLink[] = [];

		const junctionCenter = group.getRepresentativePosition();

		const junctionCoord = spline.getCoordAtPosition( junctionCenter );

		const segment = spline.segmentMap.findAt( junctionCoord.s );

		if ( !segment ) {
			Log.warn( 'Segment not found at junction', junctionCoord.s, spline.toString() );
			return links;
		}

		if ( segment instanceof TvJunction ) {
			this.addJunctionCoords( spline, links, segment );
			return links;
		}

		const isNearStart = () => sStart <= 0;

		const isNearEnd = () => sEnd >= spline.getLength();

		const differentRoads = startSegment && endSegment ? startSegment != endSegment : false;

		if ( differentRoads ) {

			// Handle junction segment for different roads
			Log.debug( 'different roads', startSegment?.toString(), endSegment?.toString() );

			SplineUtils.removeSegment( spline, junction );
			SplineUtils.addSegment( spline, sStart, junction );

			if ( startSegment instanceof TvRoad ) {

				links.push( LinkFactory.createRoadLink( startSegment, TvContactPoint.END ) );

				RoadUtils.unlinkSuccessor( startSegment );

			} else {

				Log.warn( 'Start Segment is not a Road', startSegment?.toString() );

			}

			if ( endSegment instanceof TvRoad ) {

				links.push( LinkFactory.createRoadLink( endSegment, TvContactPoint.START ) );

				RoadUtils.unlinkPredecessor( endSegment );

			} else {

				Log.warn( 'End Segment is not a Road', endSegment?.toString() );

			}

			spline.updateSegmentGeometryAndBounds();

		} else if ( isNearStart() || isNearEnd() ) {

			if ( startSegment instanceof TvRoad && endSegment instanceof TvRoad ) {

				this.handleEdgeJunction( spline, junction, links, sStart, sEnd, startSegment, endSegment, junctionWidth );

			} else {

				Log.error( spline?.toString(), startSegment?.toString(), endSegment?.toString() );

			}

		} else {

			Log.debug( 'cutting road', spline.uuid, junction.toString(), sStart, sEnd );

			return this.handleJunctionInMiddle( spline, junction, sStart, sEnd );

		}

		return links;
	}

	// createRoadCoords ( junction: TvJunction, spline: AbstractSpline, group: IntersectionGroup ): TvRoadLink[] {

	// 	const links: TvRoadLink[] = [];

	// 	const junctionCenter = group.getRepresentativePosition();

	// 	const junctionCoord = this.splineService.getCoordAt( spline, junctionCenter );

	// 	const segment = spline.segmentMap.findAt( junctionCoord.s );

	// 	if ( !segment || !( segment instanceof TvRoad ) ) {

	// 		if ( !segment ) return links;

	// 		this.addCoordsFromAdjacentSegments( spline, links, segment );

	// 		return links;

	// 	}

	// 	const junctionWidth = this.computeJunctionWidth( group, spline );

	// 	const sStart = Maths.clamp( junctionCoord.s - junctionWidth, 0, spline.getLength() );

	// 	const sEnd = Maths.clamp( junctionCoord.s + junctionWidth, 0, spline.getLength() );

	// 	const startSegment = spline.segmentMap.findAt( sStart );

	// 	const endSegment = spline.segmentMap.findAt( sEnd );

	// 	const isNearStart = () => sStart <= 0;

	// 	const isNearEnd = () => sEnd >= this.splineService.getLength( spline );

	// 	const differentRoads = startSegment && endSegment ? startSegment != endSegment : false;

	// 	if ( differentRoads ) {

	// 		// Handle junction segment for different roads
	// 		Log.debug( 'different roads', startSegment, endSegment );

	// 		SplineUtils.addSegment( spline, sStart - 5, junction );

	// 		if ( startSegment instanceof TvRoad ) {

	// 			links.push( LinkFactory.createLink( TvRoadLinkType.ROAD, startSegment, TvContactPoint.END ) );

	// 			RoadUtils.unlinkSuccessor( startSegment );

	// 		}

	// 		if ( endSegment instanceof TvRoad ) {

	// 			// NOTE: Below lines are causing issues
	// 			// endSegment.sStart = sEnd + 5;
	// 			// spline.segmentMap.remove( endSegment );
	// 			// spline.segmentMap.set( sEnd + 5, endSegment );

	// 			links.push( LinkFactory.createLink( TvRoadLinkType.ROAD, endSegment, TvContactPoint.START ) );

	// 			RoadUtils.unlinkPredecessor( endSegment );

	// 		}

	// 		this.splineBuilder.build( spline );

	// 	} else if ( isNearStart() || isNearEnd() ) {

	// 		if ( startSegment instanceof TvRoad && endSegment instanceof TvRoad ) {

	// 			this.handleEdgeJunction( spline, junction, links, sStart, sEnd, startSegment, endSegment, junctionWidth );

	// 		} else {

	// 			console.error( spline, startSegment, endSegment );

	// 		}

	// 	} else {

	// 		Log.debug( 'cutting road', spline.uuid, junction.toString(), sStart, sEnd );

	// 		return this.handleJunctionInMiddle( spline, junction, sStart, sEnd );

	// 	}

	// 	return links;
	// }

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

	findNearestJunctionForGroup ( group: IntersectionGroup ): TvJunction | undefined {

		const groupPosition = group.getRepresentativePosition();

		return this.findNearestJunction( groupPosition );

	}

	findNearestJunction ( point: Vector3 ) {

		return this.junctionService.getNearestJunction( point );

	}

	findRoadLinks ( spline: AbstractSpline, junction: TvJunction ) {

		const previousSegment = spline.segmentMap.getPrevious( junction );
		const nextSegment = spline.segmentMap.getNext( junction );

		if ( previousSegment instanceof TvRoad && nextSegment instanceof TvRoad ) {

			return [
				LinkFactory.createRoadLink( previousSegment, TvContactPoint.END ),
				LinkFactory.createRoadLink( nextSegment, TvContactPoint.START )
			];

		} else if ( previousSegment instanceof TvRoad ) {

			return [ LinkFactory.createRoadLink( previousSegment, TvContactPoint.END ) ];

		} else if ( nextSegment instanceof TvRoad ) {

			return [ LinkFactory.createRoadLink( nextSegment, TvContactPoint.START ) ];

		} else {

			Log.error( 'No Road Links Found', spline.toString(), junction.toString() );

			return [];

		}

	}

}

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
import { AbstractSpline, NewSegment, SplineType } from "../core/shapes/abstract-spline";
import { SplineIntersection } from 'app/services/junction/spline-intersection';
import { IntersectionGroup } from "./Intersection-group";
import { TvContactPoint, TvLaneType } from "../map/models/tv-common";
import { TvRoadLink, TvRoadLinkType } from "../map/models/tv-road-link";
import { JunctionService } from "../services/junction/junction.service";
import { RoadDividerService } from "../services/road/road-divider.service";
import { SplineService } from "app/services/spline/spline.service";
import { RoadBuilder } from "../map/builders/road.builder";
import { Maths } from "app/utils/maths";
import { ConnectionFactory } from "app/factories/connection.factory";
import { JunctionBuilder } from "app/services/junction/junction.builder";
import { GeometryUtils } from "app/services/surface/geometry-utils";
import { SplineFactory } from "app/services/spline/spline.factory";
import { RoadUtils } from "../utils/road.utils";
import { Box2, MathUtils, Vector2, Vector3 } from "three";
import { TvPosTheta } from "app/map/models/tv-pos-theta";
import { Log } from "app/core/utils/log";
import { TvJunctionBoundaryManager } from "../map/junction-boundary/tv-junction-boundary.manager";
import { SplineUtils } from "app/utils/spline.utils";
import { RoadFactory } from "app/factories/road-factory.service";
import { OrderedMap } from "app/core/models/ordered-map";
import { SplineFixerService } from "app/services/spline/spline.fixer";
import { JunctionRoadService } from "app/services/junction/junction-road.service";
import { ConnectionManager } from "../map/junction/connection.manager";
import { JunctionGeometryService } from "../services/junction/junction-geometry.service";
import { JunctionLinkService } from "app/services/junction/junction-link.service";

const JUNCTION_WIDTH = 10;

@Injectable( {
	providedIn: 'root'
} )
export class JunctionManager {

	private debug = true;

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
		public junctionGeometryService: JunctionGeometryService,
		public junctionRoadService: JunctionRoadService,
		public roadDividerService: RoadDividerService,
		public splineService: SplineService,
		public boundaryManager: TvJunctionBoundaryManager,
		public connectionFactory: ConnectionFactory,
		public junctionBuilder: JunctionBuilder,
		public splineFactory: SplineFactory,
		public roadFactory: RoadFactory,
		public splineFixer: SplineFixerService,
		public connectionManager: ConnectionManager,
		public junctionLinkService: JunctionLinkService,
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

		this.updateBoundary( junction );

		this.updateMesh( junction );

		this.updateBoundingBox( junction );

	}

	updateJunction ( junction: TvJunction, otherSplines: AbstractSpline[] = [] ) {

		if ( this.debug ) Log.debug( 'Update', junction.toString() );

		junction.needsUpdate = false;

		// const junctionLinks: TvRoadLink[] = [];

		// const junctionSplines = new Set<AbstractSpline>();

		// // TODO: we can also find all the splines which are found in junction boundary
		// this.junctionRoadService.getIncomingSplines( junction ).forEach( s => junctionSplines.add( s ) );

		// otherSplines.forEach( spline => junctionSplines.add( spline ) );

		// junctionSplines.forEach( spline => {

		// 	this.updateSplineInternalLinks( spline, false );

		// 	this.findLinksForJunction( spline, junction, junctionLinks );

		// } );

		// this.connectionManager.removeAllConnections( junction );

		// this.createConnections( junction, this.sortLinks( junctionLinks ) );

		const links = [];

		otherSplines.forEach( s => this.findLinksForJunction( s, junction, links ) );

		this.connectionManager.generateConnections( junction, links );

		// temporary fix for junctions
		this.mapService.map.removeJunction( junction );

		this.addJunction( junction );

	}

	detectJunctions ( spline: AbstractSpline ) {

		if ( this.debug ) Log.debug( 'DetectJunctions', spline.toString() );

		if ( this.splineService.isConnectionRoad( spline ) ) return;

		if ( spline.type == SplineType.EXPLICIT ) return;

		const oldJunctions = this.splineService.getJunctions( spline );

		const intersections = this.splineService.findIntersections( spline );

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

	updateBoundingBox ( junction: TvJunction ) {

		junction.boundingBox = this.junctionBuilder.buildBoundingBox( junction );

		const centroid = junction.boundingBox.getCenter( new Vector2() );

		junction.centroid.x = centroid.x;

		junction.centroid.y = centroid.y;

	}

	updateMesh ( junction: TvJunction ) {

		if ( junction.mesh ) this.mapService.map.gameObject.remove( junction.mesh );

		junction.mesh = this.junctionBuilder.build( junction );

		this.mapService.map.gameObject.add( junction.mesh );

	}

	removeMesh ( junction: TvJunction ) {

		if ( junction.mesh ) this.mapService.map.gameObject.remove( junction.mesh );

	}

	updateBoundary ( junction: TvJunction ) {

		this.boundaryManager.update( junction );

		// junction.depBoundingBox = this.junctionService.computeBoundingBox( junction );

	}

	removeJunction ( junction: TvJunction, spline?: AbstractSpline, processOthers = false ) {

		if ( this.debug ) Log.debug( 'Remove', junction.toString() );

		const splines = this.junctionRoadService.getIncomingSplines( junction );

		const removeSegment = ( spline: AbstractSpline ) => {

			// if junction is not auto then we should not remove the segment
			if ( !junction.auto ) return;

			const prev = spline.segmentMap.getPrevious( junction );
			const next = spline.segmentMap.getNext( junction );

			if ( prev instanceof TvRoad ) {
				prev.successor = null;
			}

			if ( next instanceof TvRoad ) {
				next.predecessor = null;
			}

			if ( SplineUtils.hasSegment( spline, junction ) ) {
				SplineUtils.removeSegment( spline, junction );
			} else {
				Log.warn( 'Segment not found in spline', junction.toString(), spline?.toString() );
			}

			this.splineFixer.setInternalLinks( spline );

			this.splineBuilder.build( spline );

		};

		this.junctionRoadService.removeLinks( junction );

		for ( let i = 0; i < splines.length; i++ ) {

			removeSegment( splines[ i ] );

			this.splineFixer.fix( splines[ i ] );

		}

		this.junctionRoadService.removeAll( junction );

		if ( this.mapService.hasJunction( junction ) ) {
			this.mapService.map.removeJunction( junction );
		} else {
			Log.warn( 'Junction already removed', junction.toString() );
		}

		this.removeMesh( junction );

		// TODO: we should check the remaing spline count instead of initial
		if ( splines.length > 2 && spline && processOthers ) {

			const otherSplines = splines.filter( s => s != spline );

			const intersections = this.splineService.findIntersections( otherSplines[ 0 ], otherSplines );

			const groups = this.createGroups( intersections );

			for ( const group of groups ) {

				this.createJunctionFromGroup( group );

			}

		}

	}

	handleNextSegment ( spline: AbstractSpline, junction: TvJunction ) {

		if ( spline.segmentMap.length < 2 ) {
			Log.warn( 'Spline has less than 2 segments' );
			return;
		}

		const previousSegment = spline.segmentMap.getPrevious( junction );

		const nextSegment = spline.segmentMap.getNext( junction );

		if ( !previousSegment && !nextSegment ) return;

		const roadCount = this.splineService.getRoads( spline ).length;

		this.updateLinks( previousSegment, nextSegment, roadCount );

		SplineUtils.removeSegment( spline, junction );

		// if previous segment is null then we need to
		// update the next segment s=0
		if ( previousSegment == null && nextSegment instanceof TvRoad ) {

			SplineUtils.updateSegment( spline, 0, nextSegment );

		}

		this.splineBuilder.build( spline );
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

				if ( this.debug ) Log.debug( 'NextSegmentRemoved', nextSegment.toString() );

			} else {

				if ( previousSegment instanceof TvRoad ) {

					// Update Link Relations if Next Road
					// Connect Next With Previous
					nextSegment.setPredecessorRoad( previousSegment, TvContactPoint.END );

				} else {

					if ( this.debug ) Log.debug( 'Previous Segment is not a Road' );

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

			if ( this.debug ) Log.debug( 'Previous Segment is Junction' );

		} else {

			if ( this.debug ) Log.debug( 'Previous Segment is NULL' );

		}


	}

	/**
	 * DOES NOT WORK CURRENTLY
	 * @param group
	 * @param junction
	 * @param mainSpline
	 * @description DOES NOT WORK
	 */
	deprecatedUpdateJunction ( group: IntersectionGroup, junction: TvJunction, mainSpline: AbstractSpline ) {

		const handleSegmentUpdate = ( spline: AbstractSpline, sStart: number, sEnd: number, junction: TvJunction ) => {

			this.insertJunction( spline, sStart, sEnd, junction );

			this.splineFixer.fixInternalLinks( spline );

			this.splineBuilder.build( spline );

		};

		group.intersections.forEach( i => {

			handleSegmentUpdate( i.spline, i.splineStart, i.splineEnd, junction );

			handleSegmentUpdate( i.otherSpline, i.otherStart, i.otherEnd, junction );

		} );

		junction.getConnections().forEach( connection => {

			this.roadService.remove( connection.connectingRoad );

		} );

		junction.connections.clear();

		const links = this.junctionRoadService.getRoadLinks( junction );

		const sorted = this.sortLinks( links );

		this.createConnections( junction, sorted );

	}

	/**
	 * This method converts a junction into intersections
	 *
	 * @param junction
	 * @returns
	 */
	getJunctionIntersections ( junction: TvJunction ): SplineIntersection[] {

		const intersections: SplineIntersection[] = [];

		const splines = this.junctionRoadService.getIncomingSplines( junction );

		for ( let i = 0; i < splines.length; i++ ) {

			const spline = splines[ i ];

			// Start the inner loop from the next spline to avoid duplicate pairs and self-comparison.
			for ( let j = i + 1; j < splines.length; j++ ) {

				const otherSpline = splines[ j ];

				// Find intersections between the current spline and the other spline and add them to the list.
				this.splineService.findIntersections( spline, [ otherSpline ] ).forEach( intersection => {

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

		const junctionSplines = this.junctionRoadService.getIncomingSplines( junction );

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

		const junctions = this.splineService.getJunctions( spline );

		const intersections = this.splineService.findIntersections( spline );

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

		this.connectionManager.removeConnections( junction, incomingRoad );

	}

	removeAllConnections ( junction: TvJunction ) {

		this.connectionManager.removeAllConnections( junction );

	}

	createNewRoad ( spline: AbstractSpline, startOffset: number ) {

		const firstRoad = this.splineService.findFirstRoad( spline );

		const newRoad = this.roadService.clone( firstRoad, 0 );

		newRoad.sStart = startOffset;

		this.mapService.map.addRoad( newRoad );

		newRoad.successor = newRoad.predecessor = null;

		return newRoad;

	}

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

				const successor = SplineUtils.findSuccessor( spline );

				// we need to disconnect the previous road with current segment junction
				if ( previousSegment instanceof TvRoad && successor instanceof TvJunction ) {

					successor.needsUpdate = true;

					const newRoad = this.createNewRoad( spline, junctionEnd );

					// new segmetn will be shiflted left
					temp.set( previousKey, newRoad );

					// and previous segment will be shifted right
					temp.set( junctionEnd, previousSegment );

					// swap the connection if previous segment predecessor is junction
					if ( previousSegment.predecessor?.element instanceof TvJunction ) {
						this.replaceConnections( previousSegment.predecessor.element, previousSegment, newRoad, TvContactPoint.START );
					}

				} else {

					temp.set( junctionEnd, this.createNewRoad( spline, junctionEnd ) );

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

	findLinksForJunction ( spline: AbstractSpline, junction: TvJunction, coords?: TvRoadLink[] ): TvRoadLink[] {

		coords = coords || [];

		const prev = spline.segmentMap.getPrevious( junction );
		const next = spline.segmentMap.getNext( junction );

		if ( prev instanceof TvRoad ) {
			coords.push( new TvRoadLink( TvRoadLinkType.ROAD, prev, TvContactPoint.END ) );
		}

		if ( next instanceof TvRoad ) {
			coords.push( new TvRoadLink( TvRoadLinkType.ROAD, next, TvContactPoint.START ) );
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

					const distance = segment.boundingBox.distanceToPoint( groupPosition );

					if ( distance < 10 ) {

						if ( this.debug ) Log.debug( 'Merging Junction Into Group', segment.toString() );

						const incomingSplines = this.junctionRoadService.getIncomingSplines( segment );

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

		this.boundaryManager.update( junction );

		this.updateMesh( junction );

		this.updateBoundingBox( junction );

		this.updateBoundary( junction );

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

				if ( this.isJunctionMatchingIntersections( junction, [ intersection ] ) ) {

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

				const intersections = this.splineService.findIntersectionsViaBox2D( spline, element );

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

		const links: TvRoadLink[] = this.createGroupCoords( group, junction );

		this.createConnections( junction, links );

		if ( this.mapService.hasJunction( junction ) ) {

			this.mapService.removeJunction( junction );

			this.addJunction( junction );

		} else {

			this.addJunction( junction );

		}
	}

	createConnections ( junction: TvJunction, links: TvRoadLink[] ) {

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

				this.connectionFactory.addConnections( junction, linkA.toRoadCoord(), linkB.toRoadCoord(), !rightConnectionCreated );

				this.connectionFactory.addConnections( junction, linkB.toRoadCoord(), linkA.toRoadCoord(), isFirstAndLast );

				if ( !rightConnectionCreated || isFirstAndLast ) {
					// TODO: check if this is needed
					// for now not needed
					// this.connectionFactory.createFakeCorners( junction, linkA.toRoadCoord(), linkB.toRoadCoord() );
				}

				rightConnectionCreated = true;

			}

		}

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

			const groupPosition = new Vector2( group.centroid.x, group.centroid.y )

			// const bbox = junction.depBoundingBox || this.junctionService.computeBoundingBox( junction );

			if ( junction.boundingBox.distanceToPoint( groupPosition ) < 10 ) {

				junctions.add( junction )

			}

		} ) );

		if ( junctions.size == 0 ) {

			return this.junctionFactory.createFromPosition( group.getRepresentativePosition() );

		}

		if ( junctions.size == 1 ) {

			return junctions.values().next().value;

		}

		Log.error( 'Multiple junctions found in group' );

	}

	createGroupCoords ( group: IntersectionGroup, junction: TvJunction ): TvRoadLink[] {

		const coords: TvRoadLink[] = [];

		const splines = new Set<AbstractSpline>();

		group.intersections.forEach( i => {

			if ( !splines.has( i.spline ) ) {

				this.insertJunction( i.spline, i.splineStart, i.splineEnd, junction );

				this.splineBuilder.buildGeometry( i.spline );

				splines.add( i.spline );

			}

			if ( !splines.has( i.otherSpline ) ) {

				this.insertJunction( i.otherSpline, i.otherStart, i.otherEnd, junction );

				this.splineBuilder.buildGeometry( i.otherSpline );

				splines.add( i.otherSpline );

			}

		} );

		splines.forEach( spline => {

			this.updateSplineInternalLinks( spline );

			this.findLinksForJunction( spline, junction, coords );

			this.splineBuilder.build( spline );

		} );

		const junctions = new Map<TvJunction, Set<AbstractSpline>>();

		splines.forEach( spline => {

			spline.segmentMap.forEach( segment => {

				if ( segment instanceof TvJunction && segment.needsUpdate ) {

					if ( !junctions.has( segment ) ) {

						junctions.set( segment, new Set<AbstractSpline>( [] ) );

					}

					junctions.get( segment ).add( spline );

					const incomingSplines = this.junctionRoadService.getIncomingSplines( segment );

					incomingSplines.forEach( inSpline => junctions.get( segment ).add( inSpline ) );

				}

			} );

			const predecessor = SplineUtils.findPredecessor( spline );

			const successor = SplineUtils.findSuccessor( spline );

			if ( predecessor instanceof TvJunction && !predecessor.auto ) {
				Log.error( 'Predecessor is not a road' );
			}

			if ( successor instanceof TvJunction && !successor.auto ) {
				Log.error( 'Successor is not a road' );
			}

		} );

		junctions.forEach( ( lines, junction ) => {

			this.updateJunction( junction, [ ...lines ] );

		} );

		return this.sortLinks( coords );

	}

	sortLinks ( links: TvRoadLink[] ): TvRoadLink[] {

		return this.roadService.sortLinks( links );

	}

	createRoadCoordNew ( spline: AbstractSpline, sStart: number, sEnd: number, junction: TvJunction, group: IntersectionGroup ): TvRoadLink[] {

		// Clamp the start and end values
		sStart = Maths.clamp( sStart, 0, spline.getLength() );
		sEnd = Maths.clamp( sEnd, 0, spline.getLength() );

		const startSegment = spline.segmentMap.findAt( sStart );
		const endSegment = spline.segmentMap.findAt( sEnd );

		const junctionWidth = Math.abs( sEnd - sStart );

		const links: TvRoadLink[] = [];

		const junctionCenter = group.getRepresentativePosition();

		const junctionCoord = this.splineService.getCoordAt( spline, junctionCenter );

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

		const isNearEnd = () => sEnd >= this.splineService.getLength( spline );

		const differentRoads = startSegment && endSegment ? startSegment != endSegment : false;

		if ( differentRoads ) {

			// Handle junction segment for different roads
			Log.debug( 'different roads', startSegment?.toString(), endSegment?.toString() );

			SplineUtils.removeSegment( spline, junction );
			SplineUtils.addSegment( spline, sStart, junction );

			if ( startSegment instanceof TvRoad ) {

				links.push( new TvRoadLink( TvRoadLinkType.ROAD, startSegment, TvContactPoint.END ) );

				RoadUtils.unlinkSuccessor( startSegment );

			} else {

				Log.warn( 'Start Segment is not a Road', startSegment?.toString() );

			}

			if ( endSegment instanceof TvRoad ) {

				links.push( new TvRoadLink( TvRoadLinkType.ROAD, endSegment, TvContactPoint.START ) );

				RoadUtils.unlinkPredecessor( endSegment );

			} else {

				Log.warn( 'End Segment is not a Road', endSegment?.toString() );

			}

			this.splineBuilder.build( spline );

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

	// 			links.push( new TvRoadLink( TvRoadLinkType.ROAD, startSegment, TvContactPoint.END ) );

	// 			RoadUtils.unlinkSuccessor( startSegment );

	// 		}

	// 		if ( endSegment instanceof TvRoad ) {

	// 			// NOTE: Below lines are causing issues
	// 			// endSegment.sStart = sEnd + 5;
	// 			// spline.segmentMap.remove( endSegment );
	// 			// spline.segmentMap.set( sEnd + 5, endSegment );

	// 			links.push( new TvRoadLink( TvRoadLinkType.ROAD, endSegment, TvContactPoint.START ) );

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

	addJunctionCoords ( spline: AbstractSpline, links: TvRoadLink[], junction: TvJunction ) {

		Log.warn( 'addJunctionCoords', junction?.toString(), spline.segmentMap );

		const previousSegment = spline.segmentMap.getPrevious( junction );

		if ( previousSegment instanceof TvRoad ) {

			links.push( new TvRoadLink( TvRoadLinkType.ROAD, previousSegment, TvContactPoint.END ) );

		} else {

			Log.warn( 'Previous Segment is not a Road', previousSegment?.toString() );

		}

		const nextSegment = spline.segmentMap.getNext( junction );

		if ( nextSegment instanceof TvRoad ) {

			links.push( new TvRoadLink( TvRoadLinkType.ROAD, nextSegment, TvContactPoint.START ) );

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

	handleEdgeJunction ( spline: AbstractSpline, junction: TvJunction, coords: TvRoadLink[], sStart: number, sEnd: number, startSegment: TvRoad, mainRoad: TvRoad, junctionWidth: number ) {

		if ( !mainRoad ) {
			Log.error( 'Main Road is NULL' );
			return;
		}

		const splineLength = this.splineService.getLength( spline );

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

					coords.push( new TvRoadLink( TvRoadLinkType.ROAD, nextLink.element, nextLink.contactPoint ) );

				} else {

					Log.warn( 'nextLink is not a road', nextLink?.toString() );

				}

			}

			mainRoad.successor = new TvRoadLink( TvRoadLinkType.JUNCTION, junction, null );

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

	handleJunctionAtEnd ( spline: AbstractSpline, junction: TvJunction, coords: TvRoadLink[], sStartJunction: number, road: TvRoad ) {

		// SplineUtils.removeSegment( spline, junction );
		SplineUtils.addSegment( spline, sStartJunction, junction );

		this.rebuildRoad( road );

		coords.push( new TvRoadLink( TvRoadLinkType.ROAD, road, TvContactPoint.END ) );

	}

	handleJunctionAtStart ( spline: AbstractSpline, junction: TvJunction, coords: TvRoadLink[], junctionWidth: number ) {

		const road = this.splineService.findFirstRoad( spline );

		SplineUtils.removeSegment( spline, road );

		SplineUtils.addSegment( spline, 0, junction );
		SplineUtils.addSegment( spline, junctionWidth, road );

		road.setPredecessor( TvRoadLinkType.JUNCTION, junction );

		this.rebuildRoad( road );

		coords.push( new TvRoadLink( TvRoadLinkType.ROAD, road, TvContactPoint.START ) );

	}

	handleJunctionInMiddle ( spline: AbstractSpline, junction: TvJunction, sStart: number, sEnd: number ): TvRoadLink[] {

		const segment = spline.segmentMap.findAt( sStart );

		if ( segment instanceof TvRoad ) {

			const newRoad = this.createNewRoadSegment( spline, segment, junction, sStart, sEnd );

			Log.debug( 'created new segment', newRoad.toString(), 'From', segment.toString(), 'For', junction.toString(), sStart, sEnd );

			return [
				new TvRoadLink( TvRoadLinkType.ROAD, segment, TvContactPoint.END ),
				new TvRoadLink( TvRoadLinkType.ROAD, newRoad, TvContactPoint.START )
			];

		} else if ( segment instanceof TvJunction ) {

			Log.debug( 'Middle segment is junction', segment.toString(), spline.toString() );

			const prev = spline.segmentMap.getPrevious( segment );
			const next = spline.segmentMap.getNext( segment );

			return [
				new TvRoadLink( TvRoadLinkType.ROAD, prev, TvContactPoint.END ),
				new TvRoadLink( TvRoadLinkType.ROAD, next, TvContactPoint.START )
			];

		} else {

			throw new Error( 'Invalid segment' );

		}


	}

	createNewRoadSegment ( spline: AbstractSpline, oldRoad: TvRoad, junction: TvJunction, sStart: number, sEnd: number ): TvRoad {

		const clone = this.roadService.clone( oldRoad, sStart );

		clone.sStart = sEnd;

		SplineUtils.addSegment( spline, sEnd, clone );

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

		SplineUtils.addSegment( spline, sStart, junction );

		this.splineBuilder.build( spline );

		return clone;

	}

	rebuildRoad ( road: TvRoad ) {

		this.splineBuilder.buildSpline( road.spline );

		this.splineBuilder.buildSegments( road.spline );

		this.splineBuilder.buildBoundingBox( road.spline );

	}

	findNearestJunctionForGroup ( group: IntersectionGroup ): TvJunction | undefined {

		const groupPosition = group.getRepresentativePosition();

		return this.findNearestJunction( groupPosition );

	}

	findNearestJunction ( point: Vector3 ) {

		let currentDistance = 10;

		let nearestJunction: TvJunction | undefined;

		this.junctionService.junctions.forEach( junction => {

			const distance = junction.centroid.distanceTo( point );

			if ( distance > 10 ) return;

			if ( distance < currentDistance ) {

				nearestJunction = junction;

				currentDistance = junction.centroid.distanceTo( point );

			}

		} );

		return nearestJunction;
	}

	findRoadLinks ( spline: AbstractSpline, junction: TvJunction ) {

		const previousSegment = spline.segmentMap.getPrevious( junction );
		const nextSegment = spline.segmentMap.getNext( junction );

		if ( previousSegment instanceof TvRoad && nextSegment instanceof TvRoad ) {

			return [
				new TvRoadLink( TvRoadLinkType.ROAD, previousSegment, TvContactPoint.END ),
				new TvRoadLink( TvRoadLinkType.ROAD, nextSegment, TvContactPoint.START )
			];

		} else if ( previousSegment instanceof TvRoad ) {

			return [ new TvRoadLink( TvRoadLinkType.ROAD, previousSegment, TvContactPoint.END ) ];

		} else if ( nextSegment instanceof TvRoad ) {

			return [ new TvRoadLink( TvRoadLinkType.ROAD, nextSegment, TvContactPoint.START ) ];

		} else {

			Log.error( 'No Road Links Found', spline.toString(), junction.toString() );

			return [];

		}

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
	// 			SplineUtils.addSegment( spline, sStartJunction, junction );
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
	// 			SplineUtils.addSegment( spline, 0, junction );
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
	// 	SplineUtils.addSegment( spline, sStart, junction );
	//
	// 	const newRoad = this.roadService.clone( startSegment, sStart );
	//
	// 	newRoad.sStart = sEnd;
	//
	// 	SplineUtils.addSegment( spline, sEnd, newRoad );
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

		this.junctionLinkService.replaceIncomingRoad( junction, oldRoad, newRoad, contact );

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
			// const center = junction.position;

			// DebugDrawService.instance.clear();
			// DebugDrawService.instance.drawSphere( center, 1.0, COLOR.MAGENTA );

			// let distanceFromCenter = Math.max( leftRoadSize.totalWidth, leftRoadSize.totalWidth );

			// const angle = this.computeApproachingAngle( leftLink, rightLink, center );

			// if ( leftRoad.spline.uuid != rightRoad.spline.uuid ) {

			// 	const diff = Math.abs( Maths.PI2 - angle );

			// 	distanceFromCenter = distanceFromCenter + distanceFromCenter * Math.tan( diff * 0.5 );

			// }

			// Log.debug( 'distanceFromCenter', distanceFromCenter, angle, leftRoad.toString(), rightRoad.toString() )

			// const junctionCoord = this.splineService.getCoordAt( rightRoad.spline, center );

			// if ( rightLink.contactPoint === TvContactPoint.START ) {

			// 	const splineOffset = junctionCoord.s + distanceFromCenter;

			// 	// If start of road then shift road
			// 	SplineUtils.addSegment( rightRoad.spline, splineOffset, rightRoad );

			// } else if ( rightLink.contactPoint === TvContactPoint.END ) {

			// 	const splineOffset = junctionCoord.s - distanceFromCenter;

			// 	// If end of road then shift junction to right
			// 	SplineUtils.addSegment( rightRoad.spline, splineOffset, junction );

			// }

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

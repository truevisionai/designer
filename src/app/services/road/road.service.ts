/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadFactory } from 'app/factories/road-factory.service';
import { SplineFactory } from '../spline/spline.factory';
import { MapService } from '../map/map.service';
import { TvRoadLink, TvRoadLinkType } from 'app/map/models/tv-road-link';
import { TvLane } from 'app/map/models/tv-lane';
import { Vector2, Vector3 } from 'three';
import { TvMapQueries } from 'app/map/queries/tv-map-queries';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { MapEvents } from 'app/events/map-events';
import { RoadCreatedEvent } from 'app/events/road/road-created-event';
import { RoadUpdatedEvent } from 'app/events/road/road-updated-event';
import { RoadRemovedEvent } from 'app/events/road/road-removed-event';
import { BaseDataService } from "../../core/interfaces/data.service";
import { TvPosTheta } from "../../map/models/tv-pos-theta";
import { Maths } from "../../utils/maths";
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { RoadUtils } from 'app/utils/road.utils';
import { GeometryUtils } from '../surface/geometry-utils';
import { MapQueryService } from 'app/map/queries/map-query.service';
import { Log } from 'app/core/utils/log';
import { ModelNotFoundException } from 'app/exceptions/exceptions';
import { Commands } from 'app/commands/commands';
import { RoadGeometryService } from './road-geometry.service';
import { RoadWidthService } from './road-width.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadService extends BaseDataService<TvRoad> {

	public static instance: RoadService;

	constructor (
		public splineFactory: SplineFactory,
		public mapService: MapService,
		public roadFactory: RoadFactory,
		public queryService: MapQueryService,
		public roadGeometryService: RoadGeometryService
	) {
		super();
		RoadService.instance = this;
	}

	all (): TvRoad[] {

		return this.roads;

	}

	getRoadFactory (): RoadFactory {

		return this.roadFactory;

	}

	get roads (): TvRoad[] {

		return this.mapService.map.getRoads();

	}

	get junctionRoads (): TvRoad[] {

		return this.roads.filter( road => road.isJunction );

	}

	get nonJunctionRoads (): TvRoad[] {

		return this.roads.filter( road => !road.isJunction );

	}

	getRoadCount (): number {

		return this.roads.length;

	}

	getRoad ( roadId: number ): TvRoad | null {

		try {

			return this.mapService.map.getRoadById( roadId );

		} catch ( error ) {

			if ( error instanceof ModelNotFoundException ) {

				Log.error( `Road with ID ${ roadId } not found.` );

				return null; // Handle the error by returning null

			} else {

				throw error; // Re-throw unexpected errors

			}

		}

	}

	clone ( road: TvRoad, s = 0 ) {

		const id = this.roadFactory.getNextRoadId();

		const clone = RoadUtils.clone( road, s, id );

		return clone;

	}

	createRampRoad ( connectionLane?: TvLane ) {

		return this.roadFactory.createRampRoad( connectionLane );

	}

	createSingleLaneRoad ( width: number ) {

		return this.roadFactory.createSingleLaneRoad( width );

	}

	createNewRoad () {

		return this.roadFactory.createNewRoad();

	}

	createDefaultRoad (): TvRoad {

		return this.roadFactory.createDefaultRoad();

	}

	createParkingRoad (): TvRoad {

		return this.roadFactory.createParkingRoad();

	}

	add ( road: TvRoad ) {

		this.mapService.map.addRoad( road );

		MapEvents.roadCreated.emit( new RoadCreatedEvent( road ) );
	}

	update ( road: TvRoad ) {

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road ) );

	}

	remove ( road: TvRoad ) {

		MapEvents.roadRemoved.emit( new RoadRemovedEvent( road ) );

	}

	duplicateRoad ( road: TvRoad ) {

		const clone = this.clone( road );

		const roadWidth = RoadWidthService.instance.findRoadWidthAt( road, 0 );

		this.shiftRoad( clone, roadWidth.totalWidth, 0 );

		Commands.AddObject( clone );

	}

	shiftRoad ( road: TvRoad, x: number, y: number ) {

		const posTheta = road.getStartPosTheta();

		posTheta.rotateDegree( -90 );

		const direction = posTheta.toDirectionVector();

		direction.multiplyScalar( x );

		road.spline.controlPoints.forEach( point => {

			// move in direction of road
			point.position.add( direction );

		} );

	}

	findRoadCoordAtPosition ( position: Vector3 ): TvRoadCoord {

		return TvMapQueries.findRoadCoord( position );

	}

	findRoadCoord ( position: Vector3, junctions = true ): TvRoadCoord | null {

		const posTheta = new TvPosTheta();

		const road = junctions ? this.findNearestRoad( position, posTheta ) : this.findNearestNonJunctionRoad( position, posTheta );

		if ( !road ) {
			return;
		}

		const roadCoord = posTheta.toRoadCoord( road );

		if ( Math.abs( roadCoord.s ) < 0.01 ) {
			return;
		}

		const width = roadCoord.t > 0 ?
			RoadWidthService.instance.findLeftWidthAt( roadCoord.road, roadCoord.s ) :
			RoadWidthService.instance.findRightWidthAt( roadCoord.road, roadCoord.s );

		if ( Math.abs( roadCoord.t ) > width ) {
			return;
		}

		return roadCoord;
	}

	findLaneAtPosition ( position: Vector3 ): TvLane {

		const roadCoord = this.findRoadCoordAtPosition( position );

		if ( !roadCoord ) return;

		const laneSection = roadCoord.road.getLaneProfile().getLaneSectionAt( roadCoord.s );

		const t = roadCoord.t;

		const lanes = laneSection.lanesMap;

		let targetLane: TvLane;

		const isLeft = t > 0;
		const isRight = t < 0;

		if ( Math.abs( t ) < 0.1 ) {
			return laneSection.getLaneById( 0 );
		}

		for ( const [ id, lane ] of lanes ) {

			// logic to skip left or right lanes depending on t value
			if ( isLeft && lane.isRight ) continue;
			if ( isRight && lane.isLeft ) continue;

			const startT = laneSection.getWidthUptoStart( lane, roadCoord.s );
			const endT = laneSection.getWidthUptoEnd( lane, roadCoord.s );

			if ( Math.abs( t ) > startT && Math.abs( t ) < endT ) {
				return lane;
			}

		}

		return targetLane;

	}

	findLaneCoord ( position: Vector3 ): TvLaneCoord {

		const roadCoord = this.findRoadCoord( position );

		if ( !roadCoord ) return;

		const posTheta = RoadGeometryService.instance.findCoordPosition( roadCoord );

		const result = this.findNearestLane( position, posTheta );

		if ( !result ) return;

		return new TvLaneCoord( roadCoord.road, result.lane.laneSection, result.lane, roadCoord.s, roadCoord.t );
	}

	createConnectionRoad ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord ): TvRoad {

		const road = this.createNewRoad();

		road.spline = this.splineFactory.createConnectingRoadSpline( road, incoming, outgoing );

		road.junction = junction;

		road.setPredecessor( TvRoadLinkType.ROAD, incoming.road, incoming.contact );

		road.setSuccessor( TvRoadLinkType.ROAD, outgoing.road, outgoing.contact );

		return road;

	}

	divideRoad ( road: TvRoad, s: number ): TvRoad {

		return RoadUtils.divideRoad( road, s, this.roadFactory.getNextRoadId() );

	}

	findNearestRoad ( position: Vector2 | Vector3, posTheta?: TvPosTheta, ...roadIdsToIgnore: number[] ): TvRoad {

		const point = new Vector2( position.x, position.y );
		const temp = new TvPosTheta();

		let nearestRoad: TvRoad = null;
		let minDistance = Number.MAX_SAFE_INTEGER;

		for ( const road of this.roads ) {

			if ( roadIdsToIgnore.includes( road.id ) ) continue;

			for ( const geometry of road.geometries ) {

				const nearestPoint = geometry.getNearestPointFrom( point.x, point.y, temp );

				const distance = point.distanceTo( nearestPoint );

				if ( distance < minDistance ) {

					minDistance = distance;
					nearestRoad = road;

					if ( posTheta ) posTheta.copy( temp );
				}
			}
		}

		return nearestRoad;

	}

	findNearestNonJunctionRoad ( position: Vector2 | Vector3, posTheta?: TvPosTheta, ...roadIdsToIgnore: number[] ): TvRoad {

		const point = new Vector2( position.x, position.y );
		const temp = new TvPosTheta();

		let nearestRoad: TvRoad = null;
		let minDistance = Number.MAX_SAFE_INTEGER;

		for ( const road of this.nonJunctionRoads ) {

			if ( roadIdsToIgnore.includes( road.id ) ) continue;

			for ( const geometry of road.geometries ) {

				const nearestPoint = geometry.getNearestPointFrom( point.x, point.y, temp );

				const distance = point.distanceTo( nearestPoint );

				if ( distance < minDistance ) {

					minDistance = distance;
					nearestRoad = road;

					if ( posTheta ) posTheta.copy( temp );
				}
			}
		}

		return nearestRoad;

	}

	findNearestLane ( position: Vector2 | Vector3, posTheta?: TvPosTheta, ...roadIdsToIgnore: number[] ) {

		let nearestLane: TvLane = null;

		const nearestRoad = this.findNearestRoad( position, posTheta, ...roadIdsToIgnore );

		const s = posTheta.s;
		const t = posTheta.t;

		for ( const laneSection of nearestRoad.laneSections ) {

			// TODO: Fix this, checkInteral does not check properly
			if ( laneSection.checkInterval( s ) ) {

				// t is positive of left
				// left lanes are positive int
				// right lanes are negative int

				let lanes: TvLane[] = [];

				// positive t means left side
				if ( t > 0 ) {

					lanes = laneSection.getLeftLanes().reverse();

				} else if ( t < 0 ) {

					lanes = laneSection.getRightLanes();

				} else if ( Maths.approxEquals( t, 0 ) ) {

					lanes = laneSection.getCenterLanes();

				}

				let cumulativeWidth = 0;

				for ( const lane of lanes ) {

					const width = lane.getWidthValue( s );

					cumulativeWidth += width;

					if ( cumulativeWidth >= Math.abs( t ) ) {

						nearestLane = lane;
						break;

					}

				}

				break;
			}

		}

		return {
			road: nearestRoad,
			lane: nearestLane
		};

	}

	STtoXYZ ( road: TvRoad, s: number, t: number ) {

		const posTheta = RoadGeometryService.instance.findRoadPosition( road, s, t );

		const position = posTheta.toVector3();

		const laneCoord = this.findLaneCoord( position );

		if ( !laneCoord ) return;

		const lane = laneCoord.lane;

		const laneHeight = lane.getHeightValue( laneCoord.s );

		position.z += laneHeight.getLinearValue( 0.5 );

		return position;
	}

	sortLinks ( links: TvRoadLink[], clockwise = true ): TvRoadLink[] {

		const points = links.map( coord => RoadGeometryService.instance.findLinkPosition( coord ) );

		const center = GeometryUtils.getCentroid( points.map( p => p.position ) );

		if ( clockwise ) {

			const angles = points.map( point => Math.atan2( point.y - center.y, point.x - center.x ) );

			return links.map( ( point, index ) => ( {
				point,
				index
			} ) ).sort( ( a, b ) => angles[ a.index ] - angles[ b.index ] ).map( sortedObj => sortedObj.point );

		} else {

			const angles = points.map( point => Math.atan2( point.y - center.y, point.x - center.x ) );

			return links.map( ( point, index ) => ( {
				point,
				index
			} ) ).sort( ( a, b ) => angles[ b.index ] - angles[ a.index ] ).map( sortedObj => sortedObj.point );

		}

	}

	findCentroid ( links: TvRoadLink[] ) {

		const points = links.map( link => RoadGeometryService.instance.findLinkPosition( link ).position );

		return GeometryUtils.getCentroid( points );

	}
}

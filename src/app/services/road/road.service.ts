/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { RoadNode } from 'app/objects/road-node';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadFactory } from 'app/factories/road-factory.service';
import { SplineFactory } from '../spline/spline.factory';
import { MapService } from '../map/map.service';
import { TvRoadLinkChildType } from 'app/map/models/tv-road-link-child';
import { TvLane } from 'app/map/models/tv-lane';
import { CommandHistory } from '../command-history';
import { AddObjectCommand } from 'app/commands/add-object-command';
import { Vector2, Vector3 } from 'three';
import { TvMapQueries } from 'app/map/queries/tv-map-queries';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { MapEvents } from 'app/events/map-events';
import { RoadCreatedEvent } from 'app/events/road/road-created-event';
import { RoadUpdatedEvent } from 'app/events/road/road-updated-event';
import { RoadRemovedEvent } from 'app/events/road/road-removed-event';
import { BaseDataService } from "../../core/interfaces/data.service";
import { TvContactPoint, TvLaneSide } from 'app/map/models/tv-common';
import { TvPosTheta } from "../../map/models/tv-pos-theta";
import { Maths } from "../../utils/maths";
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';

@Injectable( {
	providedIn: 'root'
} )
export class RoadService extends BaseDataService<TvRoad> {

	public static instance: RoadService;

	constructor (
		public splineFactory: SplineFactory,
		public mapService: MapService,
		public roadFactory: RoadFactory,
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

	getRoad ( roadId: number ) {

		return this.mapService.map.getRoadById( roadId );

	}

	clone ( road: TvRoad, s = 0 ) {

		const clone = road.clone( s );

		clone.id = this.roadFactory.getNextRoadId();

		clone.name = `Road ${ clone.id }`;

		clone.objects.object.forEach( object => object.road = clone );

		clone.sStart = road.sStart + s;

		return clone;

	}

	createRampRoad ( connectionLane: TvLane ) {

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

	createJoiningRoad ( firstNode: RoadNode, secondNode: RoadNode ) {

		const spline = this.splineFactory.createSplineFromNodes( firstNode, secondNode );

		const joiningRoad = this.roadFactory.createJoiningRoad( spline, firstNode, secondNode );

		spline.addRoadSegment( 0, joiningRoad );

		joiningRoad.spline = spline;

		return joiningRoad;

	}

	// buildRoad ( road: TvRoad ): GameObject[] {

	// 	return this.buildSpline( road.spline, false );

	// }

	// buildSpline ( spline: AbstractSpline, showNodes = true ): GameObject[] {

	// 	const gameObjects = [];

	// 	if ( spline.controlPoints.length < 2 ) {
	// 		return gameObjects;
	// 	}

	// 	spline.getSplineSegments().forEach( segment => {

	// 		if ( !segment.isRoad ) return;

	// 		const road = this.mapService.map.getRoadById( segment.id );

	// 		road.clearGeometries();

	// 		segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

	// 		// this.updateRoadNodes( road, showNodes );

	// 		const gameObject = this.roadBuilder.buildRoad( road );

	// 		road.gameObject = gameObject;

	// 		gameObjects.push( gameObject );

	// 	} );

	// 	return gameObjects;
	// }

	add ( road: TvRoad ) {

		this.mapService.map.addRoad( road );

		MapEvents.roadCreated.emit( new RoadCreatedEvent( road ) );
	}

	update ( road: TvRoad ) {

		this.updateRoadGeometries( road );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road ) );

	}

	updateRoadGeometries ( road: TvRoad ) {

		const segment = road.spline.findSegment( road );

		if ( !segment ) return;

		road.clearGeometries();

		if ( segment.geometries.length == 0 ) return;

		segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

	}

	remove ( road: TvRoad ) {

		MapEvents.roadRemoved.emit( new RoadRemovedEvent( road ) );

		this.mapService.map.removeRoad( road );

	}

	duplicateRoad ( road: TvRoad ) {

		const clone = this.clone( road );

		const roadWidth = road.getRoadWidthAt( 0 );

		this.shiftRoad( clone, roadWidth.totalWidth, 0 );

		CommandHistory.execute( new AddObjectCommand( clone ) );

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

	findRoadCoord ( position: Vector3 ): TvRoadCoord | null {

		const posTheta = new TvPosTheta();

		const road = this.findNearestRoad( position, posTheta );

		if ( !road ) {
			return;
		}

		const roadCoord = posTheta.toRoadCoord( road );

		if ( Math.abs( roadCoord.s ) < 0.01 ) {
			return;
		}

		const width = roadCoord.t > 0 ? road.getLeftSideWidth( roadCoord.s ) : road.getRightsideWidth( roadCoord.s );

		if ( Math.abs( roadCoord.t ) > width ) {
			return;
		}

		return roadCoord;
	}

	findLaneAtPosition ( position: Vector3 ): TvLane {

		const roadCoord = this.findRoadCoordAtPosition( position );

		if ( !roadCoord ) return;

		const laneSection = roadCoord.road.getLaneSectionAt( roadCoord.s );

		const t = roadCoord.t;

		const lanes = laneSection.lanes;

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

		const posTheta = roadCoord.toPosTheta();

		const result = this.findNearestLane( position, posTheta );

		if ( !result ) return;

		return new TvLaneCoord( roadCoord.road, result.lane.laneSection, result.lane, roadCoord.s, roadCoord.t );
	}

	createConnectionRoad ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord ): TvRoad {

		const road = this.createNewRoad();

		road.spline = this.splineFactory.createConnectingRoadSpline( road, incoming, outgoing );

		road.setJunction( junction );

		road.setPredecessor( TvRoadLinkChildType.road, incoming.road, incoming.contact );

		road.setSuccessor( TvRoadLinkChildType.road, outgoing.road, outgoing.contact );

		return road;

	}

	divideRoad ( road: TvRoad, s: number ): TvRoad {

		const oldSuccessor = road.successor;

		const newRoad = this.clone( road, s );

		if ( oldSuccessor?.isRoad ) {

			const nextRoad = oldSuccessor.getElement<TvRoad>();

			nextRoad.setPredecessorRoad( newRoad, TvContactPoint.END );

		}

		newRoad.successor = oldSuccessor;

		newRoad.setPredecessorRoad( road, TvContactPoint.END );

		return newRoad;
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

	/**
	 *
	 * @param road
	 * @param laneSection
	 * @param lane
	 * @param sOffset s offset is relative to lane section
	 */
	findLaneEndPosition ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number, tOffset = 0 ) {

		const t = this.findWidthUpto( road, laneSection, lane, sOffset ) + tOffset;

		const sign = lane.id > 0 ? 1 : -1;

		const posTheta = road.getPosThetaAt( laneSection.s + sOffset, t * sign );

		return posTheta;
	}

	/**
	 *
	 * @param road
	 * @param laneSection
	 * @param lane
	 * @param sOffset s offset is relative to lane section
	 * @returns
	 */
	findLaneCenterPosition ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number ) {

		const t = this.findWidthUptoCenter( road, laneSection, lane, sOffset );

		const sign = lane.id >= 0 ? 1 : -1;

		const posTheta = road.getPosThetaAt( laneSection.s + sOffset, t * sign );

		const laneHeight = lane.getHeightValue( sOffset );

		posTheta.z += laneHeight.getLinearValue( 0.5 );

		return posTheta;

	}

	/**
	 *
	 * @param road
	 * @param laneSection
	 * @param lane
	 * @param sOffset s offset is relative to lane section
	 * @returns
	 */
	findLaneStartPosition ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number ) {

		const t = this.findWidthUptoStart( road, laneSection, lane, sOffset );

		const sign = lane.id >= 0 ? 1 : -1;

		const posTheta = road.getPosThetaAt( laneSection.s + sOffset, t * sign );

		const laneHeight = lane.getHeightValue( sOffset );

		posTheta.z += laneHeight.getLinearValue( 0 );

		return posTheta;

	}

	/**
	 *
	 * @param road
	 * @param laneSection
	 * @param lane
	 * @param sOffset s offset is relative to lane section
	 * @returns
	 */
	findWidthUpto ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number ) {

		if ( lane.side == TvLaneSide.CENTER ) return 0;

		let width = 0;

		const lanes = lane.side == TvLaneSide.RIGHT ? laneSection.getRightLanes() : laneSection.getLeftLanes().reverse();

		for ( let i = 0; i < lanes.length; i++ ) {

			var element = lanes[ i ];

			width += element.getWidthValue( sOffset );

			if ( element.id == lane.id ) break;
		}

		return width;
	}

	findWidthUptoCenter ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number ) {

		if ( lane.side == TvLaneSide.CENTER ) return 0;

		let totalWidth = 0;

		const lanes = lane.side == TvLaneSide.RIGHT ? laneSection.getRightLanes() : laneSection.getLeftLanes().reverse();

		for ( let i = 0; i < lanes.length; i++ ) {

			const currentLane = lanes[ i ];

			const laneWidth = currentLane.getWidthValue( sOffset );

			totalWidth += laneWidth;

			if ( currentLane.id == lane.id ) {

				totalWidth -= laneWidth / 2;
				break;
			}
		}

		return totalWidth;
	}

	findWidthUptoStart ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number ) {

		if ( lane.side == TvLaneSide.CENTER ) return 0;

		let width = 0;

		const lanes = lane.side == TvLaneSide.RIGHT ? laneSection.getRightLanes() : laneSection.getLeftLanes().reverse();

		for ( let i = 0; i < lanes.length; i++ ) {

			const currentLane = lanes[ i ];

			if ( currentLane.id == lane.id ) break;

			width += currentLane.getWidthValue( sOffset );

		}

		return width;
	}

	/**
	 *
	 * @param road
	 * @param s
	 * @param t
	 */
	findRoadPosition ( road: TvRoad, s: number, t: number = 0 ) {

		return road.getPosThetaAt( s, t );

	}

	findRoadPositionAt ( road: TvRoad, position: Vector3 ) {

		return road.getPosThetaByPosition( position );

	}

	STtoXYZ ( road: TvRoad, s: number, t: number ) {

		const posTheta = road.getPosThetaAt( s, t );

		const position = posTheta.toVector3();

		const laneCoord = this.findLaneCoord( position );

		if ( !laneCoord ) return;

		const lane = laneCoord.lane;

		const laneHeight = lane.getHeightValue( laneCoord.s );

		position.z += laneHeight.getLinearValue( 0.5 );

		return position;
	}

}

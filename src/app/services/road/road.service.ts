/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { RoadNode } from 'app/objects/road-node';
import { TvRoad } from 'app/map/models/tv-road.model';
import { BaseService } from '../base.service';
import { RoadFactory } from 'app/factories/road-factory.service';
import { SplineFactory } from '../spline/spline.factory';
import { MapService } from '../map/map.service';
import { TvRoadLinkChildType } from 'app/map/models/tv-road-link-child';
import { TvLane } from 'app/map/models/tv-lane';
import { CommandHistory } from '../command-history';
import { AddObjectCommand } from 'app/commands/add-object-command';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Vector3 } from 'three';
import { TvMapQueries } from 'app/map/queries/tv-map-queries';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { GameObject } from 'app/objects/game-object';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { MapEvents } from 'app/events/map-events';
import { RoadCreatedEvent } from 'app/events/road/road-created-event';
import { RoadUpdatedEvent } from 'app/events/road/road-updated-event';
import { RoadRemovedEvent } from 'app/events/road/road-removed-event';
import { BaseDataService } from "../../core/interfaces/data.service";
import { TvContactPoint } from 'app/map/models/tv-common';

@Injectable( {
	providedIn: 'root'
} )
export class RoadService extends BaseDataService<TvRoad> {

	constructor (
		private splineFactory: SplineFactory,
		private mapService: MapService,
		private baseService: BaseService,
		private roadFactory: RoadFactory,
	) {
		super();
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

	private getNextRoadId (): number {

		return this.roadFactory.getNextRoadId();

	}

	clone ( road: TvRoad, s = 0 ) {

		const clone = road.clone( s );

		clone.id = this.getNextRoadId();

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

	buildRoad ( road: TvRoad ): GameObject[] {

		return this.buildSpline( road.spline, false );

	}

	buildSpline ( spline: AbstractSpline, showNodes = true ): GameObject[] {

		const gameObjects = [];

		if ( spline.controlPoints.length < 2 ) {
			return gameObjects;
		}

		spline.getSplineSegments().forEach( segment => {

			if ( !segment.isRoad ) return;

			const road = this.mapService.map.getRoadById( segment.id );

			road.clearGeometries();

			segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

			// this.updateRoadNodes( road, showNodes );

			const gameObject = this.baseService.rebuildRoad( road );

			gameObjects.push( gameObject );

		} );

		return gameObjects;
	}

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

	createConnectionRoad ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord ): TvRoad {

		const road = this.createNewRoad();

		road.spline = this.splineFactory.createConnectingRoadSpline( road, incoming, outgoing );

		road.setJunction( junction );

		road.setPredecessor( TvRoadLinkChildType.road, incoming.road, incoming.contact );

		road.setSuccessor( TvRoadLinkChildType.road, outgoing.road, outgoing.contact );

		return road;

	}

	setRoadIdCounter ( id: number ): number {

		return this.roadFactory.getNextRoadId( id );

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
}

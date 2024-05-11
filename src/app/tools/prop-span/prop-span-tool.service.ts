/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoad } from 'app/map/models/tv-road.model';
import { LaneDebugService } from '../../services/debug/lane-debug.service';
import { MapService } from 'app/services/map/map.service';
import { BaseToolService } from '../base-tool.service';
import { RoadObjectService } from '../../map/road-object/road-object.service';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { ObjectTypes } from 'app/map/models/tv-common';
import { TvRoadObject } from 'app/map/models/objects/tv-road-object';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { Object3DMap } from '../../core/models/object3d-map';
import { Object3D } from 'three';
import { TvObjectRepeat } from 'app/map/models/objects/tv-object-repeat';

@Injectable( {
	providedIn: 'root'
} )
export class PropSpanToolService {

	private controlPoints = new Object3DMap<TvObjectRepeat, Object3D>();

	private lines = new Object3DMap<TvObjectRepeat, Object3D>();

	constructor (
		public base: BaseToolService,
		private laneDebugService: LaneDebugService,
		private mapService: MapService,
		public roadObjectService: RoadObjectService,
		private controlPointFactory: ControlPointFactory,
	) {
	}

	showLines () {

		this.mapService.map.getRoads().filter( road => !road.isJunction ).forEach( road => {

			this.showRoadLines( road );

		} )

	}

	showRoadLines ( road: TvRoad ) {

		this.laneDebugService.showRoadLaneLines( road, 0.1, 0.1, 2 );

	}

	clearControlPoints () {

		this.controlPoints.clear();

		this.lines.clear();

	}

	showRoad ( road: TvRoad ) {

		road.objects.object.forEach( roadObject => {

			this.showControls( road, roadObject );

		} );

	}

	hideRoad ( road: TvRoad ) {

		road.objects.object.forEach( roadObject => {

			this.hideControls( road, roadObject );

		} );

	}

	hideControls ( road: TvRoad, roadObject: TvRoadObject ) {

		roadObject.repeats.forEach( repeat => {

			this.controlPoints.remove( repeat );

		} );

		roadObject.repeats.forEach( repeat => {

			this.lines.remove( repeat );

		} );

	}

	showControls ( road: TvRoad, roadObject: TvRoadObject ) {

		roadObject.repeats.forEach( repeat => {

			const position = road.getPosThetaAt( repeat.sStart, roadObject.t ).position;

			const controlPoint = this.controlPointFactory.createSimpleControlPoint( repeat, position );

			this.controlPoints.add( repeat, controlPoint );

		} );

		roadObject.repeats.forEach( repeat => {

			const points = this.getLinePoints( roadObject, repeat );

			// const line = this.lineService.createLine( repeat, points, 0.1, 4 );

			// this.lines.add( repeat, line );

		} );

	}

	hideRoads () {

		this.mapService.map.getRoads().filter( road => !road.isJunction ).forEach( road => {

			this.hideRoadLines( road );

		} )

	}

	hideRoadLines ( road: TvRoad ) {

		this.laneDebugService.hideRoadLaneLines( road );

	}

	createRoadSpanObject ( assetGuid: string, position: TvRoadCoord ) {

		const roadObject = this.createRoadObject( assetGuid, position, ObjectTypes.tree );

		const repeatLength = position.road.length - position.s;

		const distance = 10;

		roadObject.addRepeat( position.s, repeatLength, distance );

		return roadObject;

	}

	updateRoadSpanObject ( roadObject: TvRoadObject, repeat: TvObjectRepeat ) {

		this.removeRoadSpanObject( roadObject.road, roadObject );

		this.hideControls( roadObject.road, roadObject );

		this.addRoadSpanObject( roadObject.road, roadObject );

		this.showControls( roadObject.road, roadObject );

	}

	addRoadSpanObject ( road: TvRoad, roadObject: TvRoadObject ) {

		this.roadObjectService.addRoadObject( road, roadObject );

	}

	removeRoadSpanObject ( road: TvRoad, roadObject: TvRoadObject ) {

		this.roadObjectService.removeRoadObject( road, roadObject );

	}

	createRoadObject ( assetGuid: string, position: TvRoadCoord, objectType: ObjectTypes ) {

		const roadObject = this.roadObjectService.createRoadObject( position.road, objectType, position.s, position.t );

		roadObject.assetGuid = assetGuid;

		roadObject.width = 1;

		roadObject.length = 1;

		roadObject.height = 1;

		return roadObject;

	}

	private getLinePoints ( roadObject: TvRoadObject, repeat: TvObjectRepeat ) {

		const points = [];

		for ( let ds = 0; ds < repeat.segmentLength; ds++ ) {

			const s = repeat.sStart + ds;

			const position = roadObject.road.getPosThetaAt( s, roadObject.t ).position;

			points.push( position );

		}

		return points;

	}
}

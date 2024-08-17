/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseDebugger } from 'app/core/interfaces/base-debugger';
import { TvRoad } from 'app/map/models/tv-road.model';
import { DebugState } from 'app/services/debug/debug-state';
import { TvRoadObject } from "../../map/models/objects/tv-road-object";
import { ControlPointFactory } from "../../factories/control-point.factory";
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { RoadDebugService } from "../../services/debug/road-debug.service";
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { RoadGeometryService } from 'app/services/road/road-geometry.service';

@Injectable( {
	providedIn: 'root'
} )
export class PointMarkingToolDebugger extends BaseDebugger<TvRoad> {

	private pointsCache = new Map<TvRoadObject, SimpleControlPoint<TvRoadObject>>();

	private controlPoints = new Object3DArrayMap<TvRoad, SimpleControlPoint<TvRoadObject>[]>();

	constructor (
		private roadDebugger: RoadDebugService,
	) {
		super();
	}

	setDebugState ( road: TvRoad, state: DebugState ): void {

		this.setBaseState( road, state );

	}

	onHighlight ( road: TvRoad ): void {

		this.roadDebugger.showRoadBorderLine( road );

	}

	onUnhighlight ( road: TvRoad ): void {

		this.roadDebugger.removeRoadBorderLine( road );

	}

	onSelected ( road: TvRoad ): void {

		road.getRoadObjects().forEach( roadObject => {

			const point = this.createNode( road, roadObject );

			this.controlPoints.addItem( road, point );

		} )

	}

	onUnselected ( road: TvRoad ): void {

		this.controlPoints.removeKey( road );

	}

	onDefault ( road: TvRoad ): void {


	}

	onRemoved ( road: TvRoad ): void {

		this.controlPoints.removeKey( road );

	}

	createNode ( road: TvRoad, roadObject: TvRoadObject ) {

		const coord = RoadGeometryService.instance.findRoadPosition( road, roadObject.s, roadObject.t );

		if ( !coord ) return;

		let point: SimpleControlPoint<TvRoadObject>;

		if ( !this.pointsCache.has( roadObject ) ) {

			point = ControlPointFactory.createSimpleControlPoint( roadObject, coord.position );

			this.pointsCache.set( roadObject, point );

		} else {

			point = this.pointsCache.get( roadObject );

		}

		point.position.copy( coord.position );

		point.userData.roadObject = roadObject;

		point.userData.road = road;

		return point;

	}


	clear () {

		super.clear();

		this.controlPoints.clear();

	}

}


/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseDebugger } from 'app/core/interfaces/base-debugger';
import { TvRoad } from 'app/map/models/tv-road.model';
import { DebugState } from 'app/services/debug/debug-state';
import { DebugDrawService } from "../../services/debug/debug-draw.service";
import { TvRoadObject } from "../../map/models/objects/tv-road-object";
import { ControlPointFactory } from "../../factories/control-point.factory";
import { TvObjectRepeat } from "../../map/models/objects/tv-object-repeat";
import { Object3D } from "three";
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { DebugLine } from "../../objects/debug-line";
import { RoadDebugService } from "../../services/debug/road-debug.service";

@Injectable( {
	providedIn: 'root'
} )
export class PropSpanToolDebugger extends BaseDebugger<TvRoad> {

	private pointsCache = new Map<TvObjectRepeat, Object3D>();
	private controlPoints = new Object3DArrayMap<TvRoad, Object3D[]>();

	private lines = new Object3DArrayMap<TvRoad, Object3D[]>();
	private lineCache = new Map<TvObjectRepeat, DebugLine<any>>();

	constructor (
		private debugService: DebugDrawService,
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
			this.showControls( road, roadObject );
		} )

	}

	onUnselected ( road: TvRoad ): void {

		this.lines.removeKey( road );
		this.controlPoints.removeKey( road );

	}

	onDefault ( road: TvRoad ): void {


	}

	onRemoved ( road: TvRoad ): void {

		this.lines.removeKey( road );
		this.controlPoints.removeKey( road );

	}

	showControls ( road: TvRoad, roadObject: TvRoadObject ): void {

		roadObject.repeats.forEach( repeat => {

			const point = this.createNode( road, roadObject, repeat );

			this.controlPoints.addItem( road, point );

		} );

		roadObject.repeats.forEach( repeat => {

			const line = this.createLine( road, roadObject, repeat );

			this.lines.addItem( road, line );

		} );

	}

	createNode ( road: TvRoad, roadObject: TvRoadObject, repeat: TvObjectRepeat ) {

		const coord = road.getRoadPosition( repeat.sStart, roadObject.t );

		if ( !coord ) return;

		let point: Object3D;

		if ( !this.pointsCache.has( repeat ) ) {

			point = ControlPointFactory.createSimpleControlPoint( repeat, coord.position );

			this.pointsCache.set( repeat, point );

		} else {

			point = this.pointsCache.get( repeat );

		}

		point.position.copy( coord.position );

		point.userData.repeat = repeat;

		point.userData.roadObject = roadObject;

		point.userData.road = road;

		return point;

	}

	createLine ( road: TvRoad, roadObject: TvRoadObject, repeat: TvObjectRepeat ) {

		const points = this.getLinePoints( road, roadObject, repeat );

		let line: DebugLine<any>;

		if ( !this.lineCache.has( repeat ) ) {

			line = this.debugService.createDebugLine( repeat, points );

		} else {

			line = this.lineCache.get( repeat );

			this.debugService.updateDebugLine( line, points );

		}

		return line;

	}

	getLinePoints ( road: TvRoad, roadObject: TvRoadObject, repeat: TvObjectRepeat ) {

		const points = [];

		const segmentLength = repeat.computeLength( road.length );

		const sStart = repeat.sStart;

		const sEnd = repeat.sStart + segmentLength;

		for ( let s = sStart; s < sEnd; s++ ) {

			const clamped = Math.min( s, road.length );

			const posTheta = road.getRoadPosition( clamped, roadObject.t );

			if ( !posTheta ) continue;

			points.push( posTheta.position );

		}

		return points;

	}

	clear (): void {

		super.clear();

		this.controlPoints.clear();

		this.lines.clear();

	}

}


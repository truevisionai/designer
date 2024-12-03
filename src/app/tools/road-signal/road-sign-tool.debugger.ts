/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseDebugger } from "app/core/interfaces/base-debugger";
import { Object3DArrayMap } from "app/core/models/object3d-array-map";
import { ControlPointFactory } from "app/factories/control-point.factory";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvRoadSignal } from "app/map/road-signal/tv-road-signal.model";
import { SimpleControlPoint } from "app/objects/simple-control-point";
import { DebugState } from "app/services/debug/debug-state";
import { RoadDebugService } from "app/services/debug/road-debug.service";
import { RoadService } from "app/services/road/road.service";
import { Object3D } from "three";

@Injectable( {
	providedIn: 'root'
} )
export class RoadSignToolDebugger extends BaseDebugger<TvRoad> {

	private points = new Object3DArrayMap<TvRoad, Object3D[]>();

	private cache = new Map<TvRoadSignal, SimpleControlPoint<TvRoadSignal>>();

	constructor (
		private roadDebugger: RoadDebugService,
		private roadService: RoadService,
		private pointFactory: ControlPointFactory
	) {

		super();

	}

	setDebugState ( road: TvRoad, state: DebugState ): void {

		this.setBaseState( road, state );

	}

	onHighlight ( road: TvRoad ): void {

		if ( this.selected.has( road ) ) return;

		this.roadDebugger.showRoadBorderLine( road );

	}

	onUnhighlight ( road: TvRoad ): void {

		if ( this.selected.has( road ) ) return;

		this.roadDebugger.removeRoadBorderLine( road );

	}

	onSelected ( road: TvRoad ): void {

		this.showRoad( road );

		this.roadDebugger.showRoadBorderLine( road );

		this.selected.add( road );

	}

	onUnselected ( road: TvRoad ): void {

		this.hideRoad( road );

		this.roadDebugger.removeRoadBorderLine( road );

		this.selected.delete( road );

	}

	onDefault ( road: TvRoad ): void {

		this.hideRoad( road );

	}

	onRemoved ( road: TvRoad ): void {

		this.hideRoad( road );

	}

	showRoad ( road: TvRoad ): void {

		road.getRoadSignals().forEach( signal => {

			const node = this.createNode( road, signal );

			if ( node ) {

				this.points.addItem( road, node );

			}

		} )

	}

	hideRoad ( road: TvRoad ): void {

		this.points.removeKey( road );

	}

	createNode ( road: TvRoad, signal: TvRoadSignal ): SimpleControlPoint<TvRoadSignal> {

		// if ( signal.type == TvSignalType.RoadMark ) return;

		// if ( signal.subtype == TvSignalSubType.Text ) return;

		const posTheta = road.getRoadPosition( signal.s, signal.t );

		let point: SimpleControlPoint<TvRoadSignal>;

		if ( this.cache.has( signal ) ) {

			point = this.cache.get( signal );

			point.position.copy( posTheta.position );

		} else {

			point = this.pointFactory.createSimpleControlPoint( signal, posTheta.position );

			this.cache.set( signal, point );

		}

		return point;
	}

	clear (): void {

		this.points.clear();

		this.roadDebugger.clear();

		super.clear();

	}
}

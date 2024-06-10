import { Injectable } from "@angular/core";
import { BaseDebugger } from "app/core/interfaces/base-debugger";
import { Object3DArrayMap } from "app/core/models/object3d-array-map";
import { ControlPointFactory } from "app/factories/control-point.factory";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvRoadSignal, TvSignalType, TvSignalSubType } from "app/map/road-signal/tv-road-signal.model";
import { DebugState } from "app/services/debug/debug-state";
import { RoadDebugService } from "app/services/debug/road-debug.service";
import { RoadService } from "app/services/road/road.service";
import { Object3D } from "three";

@Injectable( {
	providedIn: 'root'
} )
export class TextMarkingToolDebugger extends BaseDebugger<TvRoad> {

	private points = new Object3DArrayMap<TvRoad, Object3D[]>();

	private cache = new Map<TvRoadSignal, Object3D>();

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

	hideRoad ( road: TvRoad ) {

		this.points.removeKey( road );

	}

	createNode ( road: TvRoad, signal: TvRoadSignal ) {

		if ( signal.type != TvSignalType.RoadMark ) return;

		if ( signal.subtype != TvSignalSubType.Text ) return;

		const posTheta = this.roadService.findRoadPosition( road, signal.s, signal.t );

		let point: Object3D;

		if ( this.cache.has( signal ) ) {

			point = this.cache.get( signal );

			point.position.copy( posTheta.position );

		} else {

			point = this.pointFactory.createSimpleControlPoint( signal, posTheta.position );

			this.cache.set( signal, point );

		}

		return point;
	}

}

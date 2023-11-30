import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { TextObjectService } from './text-object.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadSignalService } from 'app/services/signal/road-signal.service';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoadSignal, TvSignalSubType, TvSignalType } from 'app/modules/tv-map/models/tv-road-signal.model';
import { RoadService } from 'app/services/road/road.service';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { Object3DMap } from '../lane-width/object-3d-map';
import { Object3D } from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class TextMarkingToolService {

	private points = new Object3DMap<TvRoadSignal, Object3D>();

	constructor (
		public base: BaseToolService,
		public textService: TextObjectService,
		private roadSignalService: RoadSignalService,
		public roadService: RoadService,
		private controlPointFactory: ControlPointFactory,
	) {
	}

	showAllControlPoints (): void {

		this.roadService.roads.forEach( road => {

			road.getRoadSignals().forEach( signal => {

				this.createControlPoint( road, signal );

			} )

		} );

	}

	hideAllControlPoints () {

		this.points.clear();

	}

	createControlPoint ( road: TvRoad, signal: TvRoadSignal ) {

		if ( signal.type != TvSignalType.RoadMark ) return;

		if ( signal.subtype != TvSignalSubType.Text ) return;

		const position = this.roadSignalService.getSignalPosition( road, signal );

		const point = this.controlPointFactory.createSimpleControlPoint( signal, position.position );

		this.points.add( signal, point );

	}

	removeTextRoadMarking ( object: TvRoadSignal ) {

		const road = this.roadService.getRoad( object.roadId );

		this.roadSignalService.removeSignal( road, object );

	}

	addTextRoadMarking ( signal: TvRoadSignal ) {

		const road = this.roadService.getRoad( signal.roadId );

		const object3D = this.roadSignalService.buildSignal( road, signal );

		this.roadSignalService.addSignal( road, signal, object3D );

		this.createControlPoint( road, signal );

	}

	updateSignalPosition ( signal: TvRoadSignal ) {

		const road = this.roadService.getRoad( signal.roadId );

		this.roadSignalService.updateSignalPosition( road, signal );

	}

	createTextRoadMarking ( road: TvRoad, lane: TvLane, s: number, t: number, text: string ): TvRoadSignal {

		const signal = this.roadSignalService.createTextRoadMarking( road, lane, s, t, text );

		return signal;

	}

}

import { Injectable } from '@angular/core';
import { TvRoadSignal } from 'app/modules/tv-map/models/tv-road-signal.model';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadSignalBuilder } from './road-signal-factory.service';
import { Object3DMap } from 'app/tools/lane-width/object-3d-map';
import { Object3D } from 'three';
import { TvDynamicTypes, TvOrientation, TvUnit } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';

@Injectable( {
	providedIn: 'root'
} )
export class RoadSignalService {

	private objectMap = new Object3DMap<TvRoadSignal, Object3D>();

	static instance: RoadSignalService;

	constructor (
		private signalBuilder: RoadSignalBuilder,
	) {
		RoadSignalService.instance = this;
	}

	buildSignals ( road: TvRoad ) {

		road.signals.forEach( signal => {

			this.buildSignal( road, signal );

		} )

	}

	buildSignal ( road: TvRoad, signal: TvRoadSignal ) {

		const mesh = this.signalBuilder.buildSignal( road, signal );

		this.objectMap.add( signal, mesh );

		return mesh;

	}

	addSignal ( road: TvRoad, signal: TvRoadSignal, object: Object3D ) {

		road.signals.set( signal.id, signal );

		this.objectMap.add( signal, object );

	}

	removeSignal ( road: TvRoad, signal: TvRoadSignal ) {

		road.signals.delete( signal.id );

		this.objectMap.remove( signal );

	}

	createTextRoadMarking ( road: TvRoad, lane: TvLane, s: number, t: number, text: string ) {

		const signal = new TvRoadSignal( s, t, road.getRoadSignalCount(), text );

		signal.type = 'roadMark';
		signal.subtype = 'text';
		signal.dynamic = TvDynamicTypes.NO;
		signal.name = text;
		signal.text = text;
		signal.orientations = lane.id > 0 ? TvOrientation.MINUS : TvOrientation.PLUS;
		signal.zOffset = 0.005;
		signal.country = 'OpenDRIVE';
		signal.roadId = road.id;
		signal.unit = TvUnit.T;
		signal.value = 0.8;

		return signal;
	}

	updateSignalPosition ( road: TvRoad, signal: TvRoadSignal ) {

		const position = this.getSignalPosition( road, signal );

		const object = this.objectMap.get( signal );

		object.position.set( position.x, position.y, position.z );

	}

	getSignalPosition ( road: TvRoad, signal: TvRoadSignal ) {

		return road.getPositionAt( signal.s, signal.t );

	}

}

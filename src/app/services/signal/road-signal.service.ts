import { Injectable } from '@angular/core';
import { TvRoadSignal } from 'app/modules/tv-map/models/tv-road-signal.model';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadSignalFactory } from './road-signal-factory.service';
import { TvRoadObject } from 'app/modules/tv-map/models/objects/tv-road-object';
import { Object3DMap } from 'app/tools/lane-width/object-3d-map';
import { Object3D } from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class RoadSignalService {

	private objectMap = new Object3DMap<TvRoadSignal, Object3D>();

	static instance: RoadSignalService;

	constructor (
		private factory: RoadSignalFactory
	) {
		RoadSignalService.instance = this;
	}

	createSignals ( road: TvRoad ) {

		road.signals.forEach( signal => {

			this.createSignal( road, signal );

		} )

	}

	createSignal ( road: TvRoad, signal: TvRoadSignal ) {

		console.log( 'createSignal', signal );

		const mesh = this.factory.createSignal( road, signal );

		this.objectMap.add( signal, mesh );

	}

}

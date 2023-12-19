import { Injectable } from '@angular/core';
import { RoadEventListener } from './road-event-listener';
import { TrafficManager } from './traffic.manager';

@Injectable( {
	providedIn: 'root'
} )
export class EventServiceProvider {

	constructor (
		private roadEventListener: RoadEventListener,
		private trafficManager: TrafficManager
	) {
	}

	init () {

		this.roadEventListener.init();
		this.trafficManager.init();

	}

}

import { Injectable } from '@angular/core';
import { RoadEventListener } from './road-event-listener';
import { TrafficManager } from './traffic.manager';
import { RoadControlPointListener } from './road-control-point-listener';

@Injectable( {
	providedIn: 'root'
} )
export class EventServiceProvider {

	constructor (
		private roadEventListener: RoadEventListener,
		private trafficManager: TrafficManager,
		private roadControlPointListener: RoadControlPointListener,
	) {
	}

	init () {

		this.roadEventListener.init();
		this.trafficManager.init();
		this.roadControlPointListener.init();

	}

}

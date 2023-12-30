import { Injectable } from '@angular/core';
import { RoadEventListener } from './road-event-listener';
import { TrafficManager } from './traffic.manager';
import { SplinePointListener } from './spline-point.listener';
import { SplineEventListener } from './spline-event-listener';
import { JunctionEventListener } from './junction-event.listener';

@Injectable( {
	providedIn: 'root'
} )
export class EventServiceProvider {

	constructor (
		private roadEventListener: RoadEventListener,
		private trafficManager: TrafficManager,
		private spineEventListener: SplineEventListener,
		private splineControlPointListener: SplinePointListener,
		private junctionEventListener: JunctionEventListener
	) {
	}

	init () {

		this.roadEventListener.init();
		this.trafficManager.init();
		this.spineEventListener.init();
		this.splineControlPointListener.init();
		this.junctionEventListener.init();

	}

}

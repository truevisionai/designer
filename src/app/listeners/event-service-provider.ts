/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { RoadEventListener } from './road-event-listener';
import { TrafficManager } from './traffic.manager';
import { SplinePointListener } from './spline-point.listener';
import { SplineEventListener } from './spline-event-listener';
import { JunctionEventListener } from './junction-event.listener';
import { LaneEventListener } from 'app/listeners/lane-event-listener';
import { ObjectEventListener } from './object-event-listener';
import { MapManager } from "../managers/map-manager";
import { EntityManager } from "../scenario/entity/entity.manager";
import { ViewportEventSubscriber } from 'app/tools/viewport-event-subscriber';

@Injectable( {
	providedIn: 'root'
} )
export class EventServiceProvider {

	private static initialized = false;

	constructor (
		private roadEventListener: RoadEventListener,
		private trafficManager: TrafficManager,
		private spineEventListener: SplineEventListener,
		private splineControlPointListener: SplinePointListener,
		private junctionEventListener: JunctionEventListener,
		private laneEventListener: LaneEventListener,
		private assetEventListener: ObjectEventListener,
		private mapManager: MapManager,
		private entityManager: EntityManager,
		private viewportSubscriber: ViewportEventSubscriber,
	) {
	}

	init () {

		if ( EventServiceProvider.initialized ) return;

		this.roadEventListener.init();
		this.trafficManager.init();
		this.spineEventListener.init();
		this.splineControlPointListener.init();
		this.junctionEventListener.init();
		this.laneEventListener.init();
		this.assetEventListener.init();
		this.mapManager.init();
		this.entityManager.init();

		EventServiceProvider.initialized = true;
	}

}

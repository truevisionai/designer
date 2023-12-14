import { Injectable } from '@angular/core';
import { RoadEventListener } from './road-event-listener';

@Injectable( {
	providedIn: 'root'
} )
export class EventServiceProvider {

	constructor (
		private roadEventListener: RoadEventListener,
	) {
	}

	init () {

		this.roadEventListener.init();

	}

}

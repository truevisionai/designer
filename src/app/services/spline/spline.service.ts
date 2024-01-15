import { Injectable } from '@angular/core';
import { MapService } from '../map.service';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { MapEvents } from 'app/events/map-events';
import { SplineUpdatedEvent } from 'app/events/spline/spline-updated-event';
import { SplineCreatedEvent } from 'app/events/spline/spline-created-event';
import { SplineRemovedEvent } from 'app/events/spline/spline-removed-event';

@Injectable( {
	providedIn: 'root'
} )
export class SplineService {

	constructor (
		private mapService: MapService
	) { }

	addSpline ( spline: AbstractSpline ) {

		this.mapService.map.addSpline( spline );

		MapEvents.splineCreated.emit( new SplineCreatedEvent( spline ) );

	}

	removeSpline ( spline: AbstractSpline ) {

		MapEvents.splineRemoved.emit( new SplineRemovedEvent( spline ) );

		this.mapService.map.removeSpline( spline );

	}

	updateRoadSpline ( spline: AbstractSpline, rebuild: boolean = false ): void {

		MapEvents.splineUpdated.emit( new SplineUpdatedEvent( spline ) );

	}

	updateSpline ( spline: AbstractSpline ): void {

		this.updateRoadSpline( spline, true );

	}
}

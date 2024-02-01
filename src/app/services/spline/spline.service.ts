/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapService } from '../map/map.service';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { MapEvents } from 'app/events/map-events';
import { SplineUpdatedEvent } from 'app/events/spline/spline-updated-event';
import { SplineCreatedEvent } from 'app/events/spline/spline-created-event';
import { SplineRemovedEvent } from 'app/events/spline/spline-removed-event';
import { DataService } from '../../core/interfaces/data.service';

@Injectable( {
	providedIn: 'root'
} )
export class SplineService extends DataService<AbstractSpline> {

	constructor (
		private mapService: MapService
	) {
		super();
	}

	all (): AbstractSpline[] {

		return this.mapService.splines;

	}

	add ( spline: AbstractSpline ) {

		this.mapService.map.addSpline( spline );

		MapEvents.splineCreated.emit( new SplineCreatedEvent( spline ) );

	}

	remove ( spline: AbstractSpline ) {

		MapEvents.splineRemoved.emit( new SplineRemovedEvent( spline ) );

		this.mapService.map.removeSpline( spline );

	}

	update ( spline: AbstractSpline ): void {

		MapEvents.splineUpdated.emit( new SplineUpdatedEvent( spline ) );

	}

}

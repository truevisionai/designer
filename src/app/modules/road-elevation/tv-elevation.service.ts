/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { TvElevation } from 'app/map/road-elevation/tv-elevation.model';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvUtils } from 'app/map/models/tv-utils';
import { Vector3 } from 'three';
import { Log } from 'app/core/utils/log';
import { MapEvents } from 'app/events/map-events';
import { RoadUpdatedEvent } from 'app/events/road/road-updated-event';

@Injectable()
export class TvElevationService {

	constructor () { }

	validate ( road: TvRoad, elevation: TvElevation ): boolean {

		if ( elevation.s < 0 ) {
			elevation.s = 0;
			Log.warn( 'TvElevationService', 'Elevation s value is less than 0. Setting s to 0' );
		}

		if ( elevation.s > road.length ) {
			elevation.s = road.length;
			Log.warn( 'TvElevationService', 'Elevation s value is greater than road length. Setting s to road length' );
		}

		return true;
	}

	createElevation ( road: TvRoad, point: Vector3 ): TvElevation {

		const roadCoord = road.getPosThetaByPosition( point ).toRoadCoord( road );

		return this.createElevationAt( roadCoord );

	}

	createElevationAt ( roadCoord: TvRoadCoord ): TvElevation {

		const existing = roadCoord.road.getElevationProfile().getElevationAt( roadCoord.s )

		const clone = existing ? existing.clone( roadCoord.s ) : new TvElevation( roadCoord.s, 0, 0, 0, 0 );

		clone.a = roadCoord.road.getElevationProfile().getElevationValue( roadCoord.s );

		return clone;

	}

	add ( road: TvRoad, object: TvElevation ): void {

		this.validate( road, object );

		road.getElevationProfile().addElevation( object );

		TvUtils.computeCoefficients( road.getElevationProfile().getElevations(), road.length );

		this.fireRoadUpdatedEvent( road );

	}

	all ( parent: TvRoad ): TvElevation[] {

		return parent.getElevationProfile().getElevations();

	}

	remove ( road: TvRoad, elevation: TvElevation ): void {

		road.getElevationProfile().removeElevation( elevation );

		TvUtils.computeCoefficients( road.getElevationProfile().getElevations(), road.length );

		this.fireRoadUpdatedEvent( road );

	}

	update ( road: TvRoad, elevation: TvElevation ): void {

		this.validate( road, elevation );

		TvUtils.computeCoefficients( road.getElevationProfile().getElevations(), road.length );

		this.fireRoadUpdatedEvent( road );

	}

	fireRoadUpdatedEvent ( road: TvRoad ): void {

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road ) );

	}

}

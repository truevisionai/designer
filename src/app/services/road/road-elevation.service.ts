import { Injectable } from '@angular/core';
import { MapEvents } from 'app/events/map-events';
import { RoadUpdatedEvent } from 'app/events/road/road-updated-event';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { TvElevation } from 'app/modules/tv-map/models/tv-elevation';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvUtils } from 'app/modules/tv-map/models/tv-utils';
import { Vector3 } from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class RoadElevationService {

	constructor () { }

	createElevation ( road: TvRoad, point: Vector3 ) {

		const roadCoord = road.getPosThetaByPosition( point ).toRoadCoord( road );

		return this.createElevationAt( roadCoord );
	}

	createElevationAt ( roadCoord: TvRoadCoord ) {

		const elevation = roadCoord.road.getElevationAt( roadCoord.s ).clone( roadCoord.s );

		elevation.a = roadCoord.road.getElevationValue( roadCoord.s );

		return elevation;

	}

	addElevation ( road: TvRoad, elevation: TvElevation ) {

		road.addElevationInstance( elevation );

		TvUtils.computeCoefficients( road.elevationProfile.elevation, road.length );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road ) );

	}

	removeElevation ( road: TvRoad, elevation: TvElevation ) {

		road.removeElevationInstance( elevation );

		TvUtils.computeCoefficients( road.elevationProfile.elevation, road.length );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road ) );

	}

	updateElevation ( road: TvRoad, elevation: TvElevation ) {

		TvUtils.computeCoefficients( road.elevationProfile.elevation, road.length );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road ) );

	}

}

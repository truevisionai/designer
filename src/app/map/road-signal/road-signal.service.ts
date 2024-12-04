/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoadSignal } from 'app/map/road-signal/tv-road-signal.model';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Maths } from "../../utils/maths";
import { RoadSignalIdService } from "./road-signal-id.service";
import { MapEvents } from 'app/events/map-events';
import { RoadSignalAddedEvent, RoadSignalRemovedEvent, RoadSignalUpdatedEvent } from 'app/events/road-object.events';

@Injectable( {
	providedIn: 'root'
} )
export class RoadSignalService {

	constructor (
		private signalIdService: RoadSignalIdService,
	) {
	}

	addSignal ( road: TvRoad, signal: TvRoadSignal ): void {

		road.addRoadSignalInstance( signal );

		this.signalIdService.add( signal.id );

		MapEvents.roadSignalAdded.emit( new RoadSignalAddedEvent( road, signal ) );

	}

	removeSignal ( road: TvRoad, signal: TvRoadSignal ): void {

		road.removeRoadSignal( signal );

		this.signalIdService.remove( signal.id );

		MapEvents.roadSignalRemoved.emit( new RoadSignalRemovedEvent( road, signal ) );
	}

	updateSignal ( road: TvRoad, signal: TvRoadSignal ): void {

		MapEvents.roadSignalUpdated.emit( new RoadSignalUpdatedEvent( road, signal ) );

	}

	findSignal ( road: TvRoad, query: TvRoadSignal ): TvRoadSignal | undefined {

		const signals = road.getRoadSignals();

		for ( const sign of signals ) {

			if ( sign.type != query.type ) continue;

			if ( !Maths.approxEquals( sign.s, query.s ) ) continue;

			return sign;

		}

	}

	findSignalsByType ( road: TvRoad, types: string[] = [] ): TvRoadSignal[] {

		const signals = road.getRoadSignals();

		const results: TvRoadSignal[] = [];

		for ( const sign of signals ) {

			if ( !types.includes( sign.type ) ) continue;

			results.push( sign );

		}

		return results;
	}

}

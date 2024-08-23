/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoadSignal } from 'app/map/road-signal/tv-road-signal.model';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadSignalBuilder } from './road-signal.builder';
import { Group, Object3D } from 'three';
import { Maths } from "../../utils/maths";
import { RoadSignalIdService } from "./road-signal-id.service";

@Injectable( {
	providedIn: 'root'
} )
export class RoadSignalService {

	constructor (
		private signalBuilder: RoadSignalBuilder,
		private signalIdService: RoadSignalIdService,
	) {
	}

	buildSignal ( road: TvRoad, signal: TvRoadSignal ) {

		signal.mesh = this.signalBuilder.buildSignal( road, signal );

		return signal.mesh;

	}

	addSignal ( road: TvRoad, signal: TvRoadSignal, object: Object3D ) {

		road.addRoadSignalInstance( signal );

		road.signalGroup?.add( object );

		this.signalIdService.add( signal.id );

	}

	addSignalNew ( road: TvRoad, signal: TvRoadSignal ) {

		const mesh = this.buildSignal( road, signal );

		if ( !mesh ) return;

		this.addSignal( road, signal, mesh );

	}

	removeSignal ( road: TvRoad, signal: TvRoadSignal ) {

		road.removeRoadSignal( signal );

		this.signalIdService.remove( signal.id );

		road.signalGroup?.remove( signal.mesh );

	}

	updateSignal ( road: TvRoad, signal: TvRoadSignal ) {

		road.signalGroup?.remove( signal.mesh );

		this.addSignalNew( road, signal );

	}

	findSignal ( road: TvRoad, query: TvRoadSignal ): TvRoadSignal | undefined {

		const signals = road.getRoadSignals();

		for ( const sign of signals ) {

			if ( sign.type != query.type ) continue;

			if ( !Maths.approxEquals( sign.s, query.s ) ) continue;

			return sign;

		}

	}

	findSignalsByType ( road: TvRoad, types: string[] = [] ) {

		const signals = road.getRoadSignals();

		const results: TvRoadSignal[] = [];

		for ( const sign of signals ) {

			if ( !types.includes( sign.type ) ) continue;

			results.push( sign );

		}

		return results;
	}

}

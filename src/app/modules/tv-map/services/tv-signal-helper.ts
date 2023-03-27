/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OdSignalBuilder } from '../builders/od-signal-builder';
import { TvRoadSignal } from '../models/tv-road-signal.model';
import { TvRoad } from '../models/tv-road.model';

export class TvSignalHelper {

	private signalFactory = new OdSignalBuilder();

	constructor ( private road: TvRoad ) {

	}

	public create () {

		this.road.signals.forEach( signal => {

			this.createSignal( signal );

		} );

	}

	createSignal ( signal: TvRoadSignal ) {

		this.signalFactory.createSignalGameObject( this.road, signal );


	}
}

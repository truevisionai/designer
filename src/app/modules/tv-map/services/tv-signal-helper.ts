/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SignalFactory } from '../builders/signal-factory';
import { TvRoadSignal } from '../models/tv-road-signal.model';
import { TvRoad } from '../models/tv-road.model';

export class TvSignalHelper {

	private static signalFactory = new SignalFactory();

	constructor () {
	}

	public static create ( road: TvRoad ) {

		road.signals.forEach( signal => {

			this.createSignal( road, signal );

		} );

	}

	private static createSignal ( road: TvRoad, signal: TvRoadSignal ) {

		SignalFactory.createSignal( road, signal );

	}
}

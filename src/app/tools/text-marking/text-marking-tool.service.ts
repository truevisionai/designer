/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { TvRoadSignal } from 'app/map/road-signal/tv-road-signal.model';
import { RoadService } from 'app/services/road/road.service';
import { RoadSignalFactory } from 'app/map/road-signal/road-signal.factory';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { TextMarkingToolDebugger } from './text-marking-tool.debugger';

@Injectable( {
	providedIn: 'root'
} )
export class TextMarkingToolService {

	constructor (
		public toolDebugger: TextMarkingToolDebugger,
		public base: BaseToolService,
		public roadService: RoadService,
		public signalFactory: RoadSignalFactory,
	) {
	}

	createTextRoadMarking ( coord: TvRoadCoord, text: string ): TvRoadSignal {

		return this.signalFactory.createTextRoadMarking( coord, text );

	}

}

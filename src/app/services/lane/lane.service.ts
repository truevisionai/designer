/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../../tools/base-tool.service';
import { TvLane } from 'app/map/models/tv-lane';
import { MapEvents } from 'app/events/map-events';
import { TvLaneType } from 'app/map/models/tv-common';
import { LaneTypeChangedEvent } from 'app/events/lane/lane-type-changed.event';

@Injectable( {
	providedIn: 'root'
} )
export class LaneService {

	constructor (
		public base: BaseToolService,
	) { }

	addLane ( lane: TvLane ) {

		lane.laneSection.addLaneInstance( lane, true );

		MapEvents.laneCreated.emit( lane );

	}

	removeLane ( lane: TvLane ) {

		lane.laneSection.removeLane( lane );

		MapEvents.laneRemoved.emit( lane );

	}

	updateLane ( lane: TvLane ) {

		MapEvents.laneUpdated.emit( lane );

	}

	setLaneType ( lane: TvLane, type: TvLaneType ) {

		const oldType = lane.type;

		lane.type = type;

		MapEvents.laneTypeChanged.emit( new LaneTypeChangedEvent( lane, type, oldType ) );

	}

}

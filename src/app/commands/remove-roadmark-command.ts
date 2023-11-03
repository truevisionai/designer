/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MapEvents } from 'app/events/map-events';
import { TvLane } from '../modules/tv-map/models/tv-lane';
import { TvLaneRoadMark } from '../modules/tv-map/models/tv-lane-road-mark';
import { BaseCommand } from './base-command';

export class RemoveRoadmarkCommand extends BaseCommand {

	constructor ( private roadmark: TvLaneRoadMark, private lane: TvLane ) {

		super();

	}

	execute (): void {

		this.lane.removeRoadMark( this.roadmark );

		MapEvents.laneUpdated.emit( this.lane );

	}

	undo (): void {

		this.lane.addRoadMarkInstance( this.roadmark );

		MapEvents.laneUpdated.emit( this.lane );

	}

	redo (): void {

		this.execute();

	}
}

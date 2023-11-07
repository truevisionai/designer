/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/commands/base-command';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { MapEvents, RoadCreatedEvent, RoadRemovedEvent } from 'app/events/map-events';

export class RemoveRoadCommand extends BaseCommand {

	constructor ( private road: TvRoad ) {

		super();

	}

	execute (): void {

		this.map.removeRoad( this.road );

		this.road.spline.removeRoadSegmentByRoadId( this.road.id );

		MapEvents.roadRemoved.emit( new RoadRemovedEvent( this.road, true ) );
	}

	undo (): void {

		this.map.addRoad( this.road );

		this.road.spline.addRoadSegment( this.road.sStart, this.road.id );

		MapEvents.roadCreated.emit( new RoadCreatedEvent( this.road, true ) );

	}

	redo (): void {

		this.execute();

	}

}

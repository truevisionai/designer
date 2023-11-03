/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { OdBaseCommand } from '../../commands/od-base-command';
import { MapEvents, RoadCreatedEvent, RoadRemovedEvent } from 'app/events/map-events';

export class AddRoadCommand extends OdBaseCommand {

	constructor ( private roads: TvRoad[] = [], private showHelpers = false ) {

		super();

	}

	execute (): void {

		this.roads.forEach( road => {

			this.map.addRoad( road );

		} )

		this.roads.forEach( road => {

			MapEvents.roadCreated.emit( new RoadCreatedEvent( road, this.showHelpers ) );

		} )

	}

	undo (): void {

		this.roads.forEach( road => {

			this.map.roads.delete( road.id );

		} );

		this.roads.forEach( road => {

			MapEvents.roadRemoved.emit( new RoadRemovedEvent( road, true ) );

		} );

	}

	redo (): void {

		this.execute();

	}

}

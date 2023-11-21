/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { OdBaseCommand } from '../../commands/od-base-command';
import { MapEvents, RoadCreatedEvent, RoadRemovedEvent } from 'app/events/map-events';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';

export class AddRoadCommand extends OdBaseCommand {

	constructor ( private maps: TvMap, private roads: TvRoad[] = [], private showHelpers = false ) {

		super();

	}

	execute (): void {

		this.roads.forEach( road => {

			this.maps.addRoad( road );

		} )

		this.roads.forEach( road => {

			MapEvents.roadCreated.emit( new RoadCreatedEvent( road, this.showHelpers ) );

		} )

	}

	undo (): void {

		this.roads.forEach( road => {

			this.maps.roads.delete( road.id );

		} );

		this.roads.forEach( road => {

			MapEvents.roadRemoved.emit( new RoadRemovedEvent( road, true ) );

		} );

	}

	redo (): void {

		this.execute();

	}

}

export class AddRoadCommandv2 extends OdBaseCommand {

	constructor ( public maps: TvMap, private roads: TvRoad[] = [], private showHelpers = false ) {

		super();

	}

	execute (): void {

		this.roads.forEach( road => {

			this.maps.addRoad( road );

		} )

		this.roads.forEach( road => {

			MapEvents.roadCreated.emit( new RoadCreatedEvent( road, this.showHelpers ) );

		} )

	}

	undo (): void {

		this.roads.forEach( road => {

			this.maps.removeRoad( road );

		} );

		this.roads.forEach( road => {

			MapEvents.roadRemoved.emit( new RoadRemovedEvent( road, true ) );

		} );

	}

	redo (): void {

		this.execute();

	}

}

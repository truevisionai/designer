/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AppInspector } from 'app/core/inspector';
import { SceneService } from 'app/services/scene.service';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { RoadInspector } from '../../views/inspectors/road-inspector/road-inspector.component';
import { OdBaseCommand } from '../../commands/od-base-command';
import { MapEvents, RoadCreatedEvent, RoadRemovedEvent } from 'app/events/map-events';

export class AddRoadCommand extends OdBaseCommand {

	constructor ( private roads: TvRoad[] = [], private showHelpers = false ) {

		super();

	}

	execute (): void {

		this.roads.forEach( road => {

			this.map.addRoad( road );

			MapEvents.roadCreated.emit( new RoadCreatedEvent( road, this.showHelpers ) );

		} )

	}

	undo (): void {

		this.roads.forEach( road => {

			MapEvents.roadRemoved.emit( new RoadRemovedEvent( road, true ) );

			this.map.roads.delete( road.id );

		} );

	}

	redo (): void {

		this.execute();

	}

}

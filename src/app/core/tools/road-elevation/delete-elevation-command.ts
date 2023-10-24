/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';
import { SetInspectorCommand } from 'app/core/commands/set-inspector-command';
import { SceneService } from 'app/core/services/scene.service';
import { MapEvents, RoadUpdatedEvent } from 'app/events/map-events';
import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';

export class DeleteElevationCommand extends BaseCommand {

	private inspectorCommand: SetInspectorCommand;

	constructor ( private node: RoadElevationNode ) {

		super();

		this.inspectorCommand = new SetInspectorCommand( null, null );
	}

	execute (): void {

		this.node.road.removeElevationInstance( this.node.elevation );

		SceneService.removeFromTool( this.node );

		this.inspectorCommand.execute();

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( this.node.road, false ) );
	}

	undo (): void {

		this.node.road.addElevationInstance( this.node.elevation );

		SceneService.addToolObject( this.node );

		this.inspectorCommand.undo();

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( this.node.road, false ) );
	}

	redo (): void {

		this.execute();

	}

}

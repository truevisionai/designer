/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from "app/core/commands/base-command";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { RoadElevationNode } from "app/modules/three-js/objects/road-elevation-node";
import { SceneService } from "app/core/services/scene.service";
import { RoadFactory } from "app/core/factories/road-factory.service";
import { SetInspectorCommand } from "app/core/commands/set-inspector-command";

export class DeleteElevationCommand extends BaseCommand {

	private inspectorCommand: SetInspectorCommand;

	private road: TvRoad;

	constructor ( private node: RoadElevationNode ) {

		super();

		this.inspectorCommand = new SetInspectorCommand( null, null );
	}

	execute (): void {

		this.node.road.removeElevationInstance( this.node.elevation );

		SceneService.remove( this.node );

		this.inspectorCommand.execute();

		RoadFactory.rebuildRoad( this.node.road );
	}

	undo (): void {

		this.node.road.addElevationInstance( this.node.elevation );

		SceneService.add( this.node );

		this.inspectorCommand.undo();

		RoadFactory.rebuildRoad( this.node.road );
	}

	redo (): void {

		this.execute();

	}

}

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from "app/core/commands/base-command";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { RoadElevationTool } from "./road-elevation-tool";
import { SetValueCommand } from "app/modules/three-js/commands/set-value-command";
import { RoadElevationNode } from "app/modules/three-js/objects/road-elevation-node";

export class ShowElevationNodes extends BaseCommand {

	setValueCommand: SetValueCommand<RoadElevationTool, "road">;

	constructor ( private tool: RoadElevationTool, private newRoad: TvRoad, private oldRoad: TvRoad ) {

		super();

		this.setValueCommand = new SetValueCommand( this.tool, 'road', this.newRoad );

	}

	execute (): void {

		if ( this.newRoad.elevationProfile.getElevationCount() === 0 ) {

			// add elevation at begininng and end
			this.newRoad.addElevation( 0, 0, 0, 0, 0 );
			this.newRoad.addElevation( this.newRoad.length, 0, 0, 0, 0 );

		}

		this.newRoad?.showElevationNodes();
		this.oldRoad?.hideElevationNodes();

		this.setValueCommand.execute();

	}

	undo (): void {

		this.setValueCommand.undo();

		this.newRoad?.hideElevationNodes();
		this.oldRoad?.showElevationNodes();

	}

	redo (): void {

		this.execute();

	}

}


export class HideElevationNodes extends BaseCommand {

	constructor (
		private tool: RoadElevationTool,
		private oldRoad: TvRoad,
		private oldNode: RoadElevationNode
	) {

		super();

	}

	execute (): void {

		this.oldRoad?.hideElevationNodes();

		this.oldNode?.unselect();

		this.tool.road = null;

		this.tool.node = null;
	}

	undo (): void {

		this.oldRoad?.showElevationNodes();

		this.oldNode?.select();

		this.tool.road = this.oldRoad;

		this.tool.node = this.oldNode;

	}

	redo (): void {

		this.execute();

	}

}

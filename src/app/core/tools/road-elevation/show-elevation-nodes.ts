/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadElevationTool } from './road-elevation-tool';
import { RoadElevationManager } from 'app/core/managers/road-elevation-manager';

export class ShowElevationNodes extends BaseCommand {

	setValueCommand: SetValueCommand<RoadElevationTool, 'road'>;

	constructor ( private tool: RoadElevationTool, private newRoad: TvRoad, private oldRoad: TvRoad ) {

		super();

		this.setValueCommand = new SetValueCommand( this.tool, 'road', this.newRoad );

	}

	execute (): void {

		if ( this.newRoad ) RoadElevationManager.instance.showNodes( this.newRoad );
		if ( this.oldRoad ) RoadElevationManager.instance.removeNodes( this.oldRoad );

		this.setValueCommand.execute();

	}

	undo (): void {

		this.setValueCommand.undo();

		if ( this.newRoad ) RoadElevationManager.instance.removeNodes( this.newRoad );
		if ( this.oldRoad ) RoadElevationManager.instance.showNodes( this.oldRoad );

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

		RoadElevationManager.instance.removeNodes( this.oldRoad );

		this.oldNode?.unselect();

		this.tool.road = null;

		this.tool.node = null;
	}

	undo (): void {

		RoadElevationManager.instance.showNodes( this.oldRoad );

		this.oldNode?.select();

		this.tool.road = this.oldRoad;

		this.tool.node = this.oldNode;

	}

	redo (): void {

		this.execute();

	}

}

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/commands/base-command';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadElevationTool } from './road-elevation-tool';
import { ElevationManager } from 'app/core/managers/elevation-manager';

export class ShowElevationNodes extends BaseCommand {

	setValueCommand: SetValueCommand<RoadElevationTool, 'road'>;

	constructor ( private tool: RoadElevationTool, private newRoad: TvRoad, private oldRoad: TvRoad ) {

		super();

		this.setValueCommand = new SetValueCommand( this.tool, 'road', this.newRoad );

	}

	execute (): void {

		if ( this.newRoad ) ElevationManager.instance.showNodes( this.newRoad );
		if ( this.oldRoad ) ElevationManager.instance.removeNodes( this.oldRoad );

		this.setValueCommand.execute();

	}

	undo (): void {

		this.setValueCommand.undo();

		if ( this.newRoad ) ElevationManager.instance.removeNodes( this.newRoad );
		if ( this.oldRoad ) ElevationManager.instance.showNodes( this.oldRoad );

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

		ElevationManager.instance.removeNodes( this.oldRoad );

		this.oldNode?.unselect();

		this.tool.road = null;

		this.tool.node = null;
	}

	undo (): void {

		ElevationManager.instance.showNodes( this.oldRoad );

		this.oldNode?.select();

		this.tool.road = this.oldRoad;

		this.tool.node = this.oldNode;

	}

	redo (): void {

		this.execute();

	}

}

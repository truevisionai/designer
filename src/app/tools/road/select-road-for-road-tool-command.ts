/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadControlPoint } from '../../modules/three-js/objects/road-control-point';
import { RoadNode } from '../../modules/three-js/objects/road-node';
import { RoadInspector } from '../../views/inspectors/road-inspector/road-inspector.component';
import { BaseCommand } from '../../commands/base-command';
import { SetInspectorCommand } from '../../commands/set-inspector-command';
import { RoadTool } from './road-tool';

export class SelectRoadForRoadToolCommand extends BaseCommand {

	private setInspectorCommand: SetInspectorCommand;

	private readonly oldRoad?: TvRoad;
	private readonly oldControlPoint?: RoadControlPoint;
	private readonly oldNode?: RoadNode;

	constructor ( private tool: RoadTool, private newRoad?: TvRoad ) {

		super();

		this.oldRoad = tool.road;
		this.oldNode = tool.node;
		this.oldControlPoint = tool.controlPoint;

		this.setInspectorCommand = new SetInspectorCommand( RoadInspector, { road: newRoad } );
	}

	execute (): void {

		this.tool.road = this.newRoad;
		this.tool.node = null;
		this.tool.controlPoint = null;

		this.newRoad?.showHelpers();
		this.newRoad?.showControlPoints();
		this.newRoad?.showSpline();

		this.oldRoad?.hideSpline();
		this.oldControlPoint?.unselect();
		this.oldNode?.unselect();

		this.setInspectorCommand.execute();

	}

	undo (): void {

		this.tool.road = this.oldRoad;
		this.tool.node = this.oldNode;
		this.tool.controlPoint = this.oldControlPoint;

		this.newRoad?.hideSpline();
		this.newRoad?.hideControlPoints();

		this.oldRoad?.showControlPoints();
		this.oldRoad?.showHelpers();
		this.oldRoad?.showSpline();
		this.oldNode?.select();
		this.oldControlPoint?.select();

		this.setInspectorCommand.undo();

	}

	redo (): void {

		this.execute();

	}

}

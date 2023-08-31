/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SelectPointCommand } from 'app/core/commands/select-point-command';
import { RoadFactory } from 'app/core/factories/road-factory.service';
import { SceneService } from 'app/core/services/scene.service';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { Vector3 } from 'three';
import { OdBaseCommand } from '../../commands/od-base-command';
import { RoadTool } from './road-tool';

export class CreateControlPointCommand extends OdBaseCommand {

	private selectPointCommand: SelectPointCommand;
	private point: RoadControlPoint;

	constructor ( private tool: RoadTool, position: Vector3 ) {

		super();

		this.point = RoadFactory.createFirstRoadControlPoint( position );

		this.selectPointCommand = new SelectPointCommand( tool, this.point, RoadInspector, {
			road: this.point.road,
			controlPoint: this.point
		} );
	}

	execute (): void {

		this.tool.road = this.point.road;

		this.selectPointCommand.execute();

		this.point.visible = true;

		SceneService.add( this.point );
	}

	undo (): void {

		this.tool.road = null;

		this.selectPointCommand.undo();

		this.point.visible = true;

		SceneService.remove( this.point );
	}

	redo (): void {

		this.execute();

	}

}

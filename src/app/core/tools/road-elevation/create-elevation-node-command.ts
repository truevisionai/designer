/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';
import { SelectPointCommand } from 'app/core/commands/select-point-command';
import { SetInspectorCommand } from 'app/core/commands/set-inspector-command';
import { RoadFactory } from 'app/core/factories/road-factory.service';
import { SceneService } from 'app/core/services/scene.service';
import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';
import { TvElevation } from 'app/modules/tv-map/models/tv-elevation';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { Vector3 } from 'three';
import { RoadElevationTool } from './road-elevation-tool';

export class CreateElevationNodeCommand extends BaseCommand {

	private elevation: TvElevation;

	private selectPointCommand: SelectPointCommand;

	private inspectorCommand: SetInspectorCommand;

	constructor ( private tool: RoadElevationTool, private road: TvRoad, point: Vector3 ) {

		super();

		const roadCoord = road.getCoordAt( point );

		this.elevation = road.getElevationAt( roadCoord.s ).clone( roadCoord.s );

		this.elevation.node = new RoadElevationNode( road, this.elevation );

		this.selectPointCommand = new SelectPointCommand( tool, this.elevation.node );

		this.inspectorCommand = new SetInspectorCommand( DynamicInspectorComponent, this.elevation.node );
	}

	execute (): void {

		this.road.addElevationInstance( this.elevation );

		SceneService.add( this.elevation.node );

		this.selectPointCommand.execute();

		this.inspectorCommand.execute();

		RoadFactory.rebuildRoad( this.road );
	}

	undo (): void {

		this.road.removeElevationInstance( this.elevation );

		SceneService.remove( this.elevation.node );

		this.selectPointCommand.undo();

		this.inspectorCommand.undo();

		RoadFactory.rebuildRoad( this.road );
	}

	redo (): void {

		this.execute();

	}

}

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from 'app/core/services/scene.service';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvRoadType } from 'app/modules/tv-map/models/tv-common';
import { Vector3 } from 'three';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { RoadInspector } from '../../views/inspectors/road-inspector/road-inspector.component';
import { RoadTool } from '../tools/road-tool';
import { OdBaseCommand } from './od-base-command';
import { SetInspectorCommand } from './set-inspector-command';

export class CreateRoadCommand extends OdBaseCommand {

	private newRoad: TvRoad;
	private newPoint: RoadControlPoint;
	private setInspectorCommand: SetInspectorCommand;

	constructor ( private tool: RoadTool, private position: Vector3 ) {

		super();

		this.newRoad = this.map.addDefaultRoadWithType( TvRoadType.TOWN, 40 );

		this.newPoint = this.newRoad.addControlPointAt( this.position );

		this.setInspectorCommand = new SetInspectorCommand( RoadInspector, {
			road: this.newRoad,
			controlPoint: this.newPoint
		} );
	}

	execute (): void {

		this.tool.road = this.newRoad;
		this.tool.controlPoint = this.newPoint;
		this.tool.node = null;

		this.newPoint?.select();

		this.setInspectorCommand.execute();

	}

	undo (): void {

		this.tool.road = null;
		this.tool.controlPoint = null;
		this.tool.node = null;

		this.newPoint?.unselect();

		this.newRoad.spline.removeControlPoint( this.newPoint );

		SceneService.remove( this.newPoint );

		this.newRoad.spline.hide();

		this.map.removeRoad( this.newRoad );

		this.setInspectorCommand.undo();

	}

	redo (): void {

		this.tool.road = this.newRoad;
		this.tool.controlPoint = this.newPoint;
		this.tool.node = null;

		this.newPoint?.select();
		this.newPoint.visible = true;

		this.newRoad.addControlPoint( this.newPoint );

		this.map.addRoadInstance( this.newRoad );

		this.setInspectorCommand.execute();

	}


}

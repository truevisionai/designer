/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SelectPointCommand } from 'app/commands/select-point-command';
import { RoadFactory } from 'app/factories/road-factory.service';
import { SceneService } from 'app/services/scene.service';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { Vector3 } from 'three';
import { OdBaseCommand } from '../../commands/od-base-command';
import { RoadTool } from './road-tool';
import { MapEvents } from 'app/events/map-events';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { AbstractControlPoint } from "../../modules/three-js/objects/abstract-control-point";

export class CreateControlPointCommand extends OdBaseCommand {

	private selectPointCommand: SelectPointCommand;
	private point: AbstractControlPoint;
	private road: TvRoad;

	constructor ( private tool: RoadTool, position: Vector3 ) {

		super();

		const res = RoadFactory.createFirstRoadControlPoint( position )

		this.point = res.point;

		this.road = res.road;

		// this.selectPointCommand = new SelectPointCommand( tool, this.point, RoadInspector, {
		// 	road: this.point.mainObject,
		// 	controlPoint: this.point
		// } );
	}

	execute (): void {

		this.tool.selectedRoad = this.road;

		// this.selectPointCommand.execute();

		this.point.visible = true;

		SceneService.addToMain( this.point );

		this.map.addSpline( this.point.mainObject );

		// MapEvents.roadControlPointCreated.emit( {
		// 	road: this.point.road,
		// 	controlPoint: this.point
		// } );
	}

	undo (): void {

		this.tool.selectedRoad = null;

		// this.selectPointCommand.undo();

		this.point.visible = true;

		SceneService.removeFromMain( this.point );

		this.map.removeSpline( this.point.mainObject );

		// MapEvents.roadControlPointRemoved.emit( {
		// 	road: this.point.road,
		// 	controlPoint: this.point
		// } );
	}

	redo (): void {

		this.execute();

	}

}

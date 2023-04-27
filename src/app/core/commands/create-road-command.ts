/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AppInspector } from 'app/core/inspector';
import { SceneService } from 'app/core/services/scene.service';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { RoadInspector } from '../../views/inspectors/road-inspector/road-inspector.component';
import { OdBaseCommand } from './od-base-command';
import { Vector3 } from 'three';
import { RoadFactory } from '../factories/road-factory.service';
import { TvRoadType } from 'app/modules/tv-map/models/tv-common';
import { RoadTool } from '../tools/road-tool';

export class CreateRoadCommand extends OdBaseCommand {

	private newRoad: TvRoad;

	private newPoint: RoadControlPoint;

	constructor ( private tool: RoadTool, private position: Vector3 ) {

		super();

	}

	execute (): void {

		this.newRoad = this.tool.road = this.map.addDefaultRoadWithType( TvRoadType.TOWN, 40 );

		this.newPoint = this.tool.controlPoint = this.newRoad.addControlPointAt( this.position );

		AppInspector.setInspector( RoadInspector, {
			road: this.newRoad,
			controlPoint: this.newPoint
		} );

	}

	undo (): void {

		this.newRoad.spline.removeControlPoint( this.newPoint );

		SceneService.remove( this.newPoint );

		this.newRoad.spline.hide();

		this.map.removeRoad( this.newRoad );

		AppInspector.clear();

	}

	redo (): void {

		this.newPoint.visible = true;

		this.newRoad.addControlPoint( this.newPoint );

		this.map.addRoadInstance( this.newRoad );

		AppInspector.setInspector( RoadInspector, {
			road: this.newRoad,
			controlPoint: this.newPoint
		} );

	}


}

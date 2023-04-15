/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadFactory } from 'app/core/factories/road-factory.service';
import { AppInspector } from 'app/core/inspector';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { RoadInspector } from '../../views/inspectors/road-inspector/road-inspector.component';
import { OdBaseCommand } from './od-base-command';
import { RoadTool } from '../tools/road-tool';
import { Vector3 } from 'three';

export class AddRoadPointCommand extends OdBaseCommand {

	private newPoint: RoadControlPoint;

	private oldPoint: RoadControlPoint;;

	constructor ( private tool: RoadTool, private road: TvRoad, private position: Vector3 ) {

		super();

		this.oldPoint = this.tool.controlPoint;

	}

	execute (): void {

		this.newPoint = this.tool.controlPoint = RoadFactory.addControlPoint( this.road, this.position );

		AppInspector.setInspector( RoadInspector, {
			road: this.road,
			controlPoint: this.newPoint
		} );

	}

	undo (): void {

		RoadFactory.removeControlPoint( this.road, this.newPoint );

		AppInspector.setInspector( RoadInspector, {
			road: this.road,
			controlPoint: this.oldPoint
		} );

	}

	redo (): void {

		RoadFactory.addControlPointNew( this.road, this.newPoint );

		AppInspector.setInspector( RoadInspector, {
			road: this.road,
			controlPoint: this.newPoint
		} );
	}

}

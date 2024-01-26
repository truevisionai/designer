/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/commands/base-command';
import { SelectPointCommand } from 'app/commands/select-point-command';
import { SceneService } from 'app/services/scene.service';
import { DynamicControlPoint } from 'app/objects/dynamic-control-point';
import { PropPolygon } from 'app/map/models/prop-polygons';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { Vector3 } from 'three';
import { PropPolygonTool } from './prop-polygon-tool';

export class AddPropPolygonPointCommand extends BaseCommand {

	private newPoint: DynamicControlPoint<PropPolygon>;
	private selectCommand: SelectPointCommand;

	constructor ( private tool: PropPolygonTool, private polygon: PropPolygon, private position: Vector3 ) {

		super();

		this.newPoint = new DynamicControlPoint( polygon, position );

		this.selectCommand = new SelectPointCommand( this.tool, this.newPoint, DynamicInspectorComponent, this.polygon );

	}

	execute (): void {

		this.polygon.addControlPoint( this.newPoint );

		this.polygon.showControlPoints();
		this.polygon.showCurve();

		this.selectCommand.execute();

		SceneService.addToMain( this.newPoint );

	}

	undo (): void {

		this.polygon.removeControlPoint( this.newPoint );

		this.polygon.showControlPoints();

		if ( this.polygon.spline.controlPoints.length < 2 ) {
			this.polygon.spline?.hideLines();
		}

		this.selectCommand.undo();

		SceneService.removeFromMain( this.newPoint );

	}

	redo (): void {

		this.execute();

	}

}

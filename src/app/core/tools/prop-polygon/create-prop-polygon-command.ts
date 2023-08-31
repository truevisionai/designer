/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';
import { SelectPointCommand } from 'app/core/commands/select-point-command';
import { SceneService } from 'app/core/services/scene.service';
import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { PropPolygon } from 'app/modules/tv-map/models/prop-polygons';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { Vector3 } from 'three';
import { PropPolygonTool } from './prop-polygon-tool';

export class CreatePropPolygonCommand extends BaseCommand {

	private readonly polygon: PropPolygon;
	private readonly point: DynamicControlPoint<PropPolygon>;

	private selectPointCommand: SelectPointCommand;

	constructor ( private tool: PropPolygonTool, prop: any, position: Vector3 ) {

		super();

		this.polygon = new PropPolygon( prop.guid );

		this.point = new DynamicControlPoint( this.polygon, position );

		this.selectPointCommand = new SelectPointCommand( this.tool, this.point, DynamicInspectorComponent, this.polygon );

	}

	execute (): void {

		this.map.propPolygons.push( this.polygon );

		this.polygon.addControlPoint( this.point );

		this.selectPointCommand.execute();

		SceneService.add( this.point );

		SceneService.add( this.polygon.mesh );
	}

	undo (): void {

		const index = this.map.propPolygons.indexOf( this.polygon );

		this.map.propPolygons.splice( index, 1 );

		this.polygon.removeControlPoint( this.point );

		this.selectPointCommand.undo();

		SceneService.remove( this.point );

		SceneService.remove( this.polygon.mesh );
	}

	redo (): void {

		this.execute();

	}

}

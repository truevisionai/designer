import { BaseCommand } from 'app/core/commands/base-command';
import { SelectMainObjectCommand, SelectPointCommand } from 'app/core/commands/select-point-command';
import { SetInspectorCommand } from 'app/core/commands/set-inspector-command';
import { SceneService } from 'app/core/services/scene.service';
import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { PropPolygon } from 'app/modules/tv-map/models/prop-polygons';
import {
	PropPolygonInspectorComponent,
	PropPolygonInspectorData
} from 'app/views/inspectors/prop-polygon-inspector/prop-polygon-inspector.component';
import { Vector3 } from 'three';
import { PropPolygonTool } from './prop-polygon-tool';

export class CreatePropPolygonCommand extends BaseCommand {

	private readonly polygon: PropPolygon;
	private readonly point: DynamicControlPoint<PropPolygon>;

	private inspectorCommand: SetInspectorCommand;
	private selectPointCommand: SelectPointCommand;
	private selectObjectCommand: SelectMainObjectCommand;

	constructor ( private tool: PropPolygonTool, prop: any, position: Vector3 ) {

		super();

		this.polygon = new PropPolygon( prop.guid );

		this.point = new DynamicControlPoint( this.polygon, position );

		this.inspectorCommand = new SetInspectorCommand( PropPolygonInspectorComponent, new PropPolygonInspectorData(
			this.point,
			this.polygon,
		) );

		this.selectPointCommand = new SelectPointCommand( this.tool, this.point );
		this.selectObjectCommand = new SelectMainObjectCommand( this.tool, this.polygon );

	}

	execute (): void {

		this.map.propPolygons.push( this.polygon );

		this.polygon.addControlPoint( this.point );

		this.polygon.showControlPoints();
		this.polygon.hideCurve();

		this.inspectorCommand.execute();
		this.selectPointCommand.execute();
		this.selectObjectCommand.execute();

		SceneService.add( this.point );

	}

	undo (): void {

		const index = this.map.propPolygons.indexOf( this.polygon );
		this.map.propPolygons.splice( index, 1 );

		this.polygon.removeControlPoint( this.point );

		this.polygon.hideControlPoints();
		this.polygon.hideCurve();

		this.inspectorCommand.undo();
		this.selectPointCommand.undo();
		this.selectObjectCommand.undo();

		SceneService.remove( this.point );


	}

	redo (): void {

		this.execute();

	}

}

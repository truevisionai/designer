/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from '../services/scene.service';
import { BaseCommand } from './base-command';
import { PropCurve } from 'app/modules/tv-map/models/prop-curve';
import { PropModel } from '../models/prop-model.model';
import { BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { AppInspector } from '../inspector';
import { PropCurveInspectorComponent, PropCurveInspectorData } from 'app/views/inspectors/prop-curve-inspector/prop-curve-inspector.component';
import { PropCurveTool } from '../tools/prop-curve-tool';

export class CreatePropCurveCommand extends BaseCommand {

	private curve: PropCurve;

	constructor ( private tool: PropCurveTool, private prop: PropModel, private point: BaseControlPoint ) {

		super();

		this.curve = new PropCurve( this.prop.guid );

		point.mainObject = this.curve;
	}

	execute (): void {

		this.tool.curve = this.curve;

		this.tool.point = this.point;

		this.map.propCurves.push( this.curve );

		this.curve.addControlPoint( this.point );

		this.curve.show();

		const data = new PropCurveInspectorData( this.point, this.curve );

		AppInspector.setInspector( PropCurveInspectorComponent, data );
	}

	undo (): void {

		this.tool.curve = null;

		this.tool.point = null;

		this.curve.delete();

		SceneService.remove( this.point );

		const index = this.map.propCurves.indexOf( this.curve );

		this.map.propCurves.splice( index, 1 );

	}

	redo (): void {

		SceneService.add( this.point );

		this.execute();

	}

}

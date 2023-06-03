/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { PropCurve } from 'app/modules/tv-map/models/prop-curve';
import { BaseCommand } from '../../commands/base-command';
import { SceneService } from '../../services/scene.service';
import { PropCurveTool } from './prop-curve-tool';

export class AddPropCurvePointCommand extends BaseCommand {

	constructor ( private tool: PropCurveTool, private curve: PropCurve, private point: BaseControlPoint ) {

		super();

		point.mainObject = this.curve;

	}

	execute (): void {

		this.tool.curve = this.curve;

		this.tool.point = this.point;

		this.curve.addControlPoint( this.point );

	}

	undo (): void {

		SceneService.remove( this.point );

		this.curve.removeControlPoint( this.point );

	}

	redo (): void {

		SceneService.add( this.point );

		this.curve.addControlPoint( this.point );

	}

}

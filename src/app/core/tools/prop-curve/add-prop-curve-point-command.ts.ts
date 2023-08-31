/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SelectPointCommand } from 'app/core/commands/select-point-command';
import { BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { PropCurve } from 'app/modules/tv-map/models/prop-curve';
import {
	PropCurveInspectorComponent,
	PropCurveInspectorData
} from 'app/views/inspectors/prop-curve-inspector/prop-curve-inspector.component';
import { BaseCommand } from '../../commands/base-command';
import { SceneService } from '../../services/scene.service';
import { PropCurveToolV2 } from './prop-curve-tool';

export class AddPropCurvePointCommand extends BaseCommand {

	private selectPointCommand: SelectPointCommand;

	constructor ( private tool: PropCurveToolV2, private curve: PropCurve, private point: BaseControlPoint ) {

		super();

		point.mainObject = this.curve;

		const data = new PropCurveInspectorData( this.point, this.curve );

		this.selectPointCommand = new SelectPointCommand( this.tool as PropCurveToolV2, this.point, PropCurveInspectorComponent, data );

	}

	execute (): void {

		SceneService.add( this.point );

		this.selectPointCommand.execute();

		this.curve.addControlPoint( this.point );

	}

	undo (): void {

		SceneService.remove( this.point );

		this.selectPointCommand.undo();

		this.curve.removeControlPoint( this.point );

	}

	redo (): void {

		this.execute();

	}

}

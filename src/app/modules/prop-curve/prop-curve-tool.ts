/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { ToolType } from '../../tools/tool-types.enum';
import { PropCurveToolDebugger } from "./services/prop-curve-tool.debugger";
import { PropCurve } from "../../map/prop-curve/prop-curve.model";
import { PropCurveService } from "./services/prop-curve.service";
import { SplineService } from "../../services/spline/spline.service";
import { ObjectUserDataStrategy } from "../../core/strategies/select-strategies/object-user-data-strategy";
import { ToolWithHandler } from "app/tools/base-tool-v2";
import { BaseToolService } from "app/tools/base-tool.service";
import { PropCurvePointController } from "./controllers/prop-curve-point-controller.service";
import { PropCurvePointCreator } from "./services/prop-curve-point-creator";
import { PropCurveCreator } from "./services/prop-curve-creator";
import { PropCurveController } from "./controllers/prop-curve-controller.service";
import { PropCurvePointVisualizer, PropCurveVisualizerService } from "./visualizers/prop-curve-visualizer.service";
import { PropCurvePoint } from "./objects/prop-curve-point";
import { PropCurvePointDragHandler } from "./handlers/prop-point-drag-handler";
import { PropCurveInspector } from "./inspectors/prop-curve.inspector";
import { PointSelectionStrategy } from "app/core/strategies/select-strategies/control-point-strategy";

@Injectable()
export class PropCurveToolService {

	constructor (
		public toolDebugger: PropCurveToolDebugger,
		public service: PropCurveService,
		public splineService: SplineService,
		public base: BaseToolService,
	) {
	}
}

export class PropCurveTool extends ToolWithHandler {

	public name: string = 'PropCurveTool';

	public toolType = ToolType.PropCurve;

	constructor ( private tool: PropCurveToolService ) {

		super();

	}

	init () {

		super.init();

		this.addSelectionStrategy( PropCurvePoint, new PointSelectionStrategy() );
		this.addSelectionStrategy( PropCurve, new ObjectUserDataStrategy<PropCurve>( PropCurve.tag, 'curve' ) );

		this.addController( PropCurvePoint, this.tool.base.injector.get( PropCurvePointController ) );
		this.addController( PropCurve, this.tool.base.injector.get( PropCurveController ) );

		this.addVisualizer( PropCurvePoint, this.tool.base.injector.get( PropCurvePointVisualizer ) );
		this.addVisualizer( PropCurve, this.tool.base.injector.get( PropCurveVisualizerService ) );

		this.addDragHandler( PropCurvePoint, this.tool.base.injector.get( PropCurvePointDragHandler ) );

		this.addCreationStrategy( this.tool.base.injector.get( PropCurvePointCreator ) );
		this.addCreationStrategy( this.tool.base.injector.get( PropCurveCreator ) );

	}

	enable (): void {

		super.enable();

		this.tool.service.all().forEach( curve => {
			this.updateVisuals( curve );
		} );

	}

	override onObjectUpdated ( object: object ): void {

		if ( object instanceof PropCurveInspector ) {

			super.onObjectUpdated( object.curve );

		} else {

			super.onObjectUpdated( object );

		}

	}

}

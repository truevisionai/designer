/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PointerEventData } from 'app/events/pointer-event-data';
import { PropManager } from 'app/managers/prop-manager';
import { PropModel } from '../../map/prop-point/prop-model.model';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { Vector3 } from 'three';
import { PropCurveInspector } from './prop-curve.inspector';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { PropCurveToolDebugger } from "./prop-curve-tool.debugger";
import { PropCurve } from "../../map/prop-curve/prop-curve.model";
import { PropCurveService } from "../../map/prop-curve/prop-curve.service";
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { ControlPointStrategy } from "../../core/strategies/select-strategies/control-point-strategy";
import { DebugState } from "../../services/debug/debug-state";
import { SplineService } from "../../services/spline/spline.service";
import { ObjectUserDataStrategy } from "../../core/strategies/select-strategies/object-user-data-strategy";

@Injectable( {
	providedIn: 'root'
} )
export class PropCurveToolService {

	constructor (
		public toolDebugger: PropCurveToolDebugger,
		public service: PropCurveService,
		public splineService: SplineService,
	) {
	}
}

export class PropCurveTool extends BaseTool<PropCurve> {

	public name: string = 'PropCurveTool';

	public toolType = ToolType.PropCurve;

	constructor ( private tool: PropCurveToolService ) {

		super();

	}

	init () {

		super.init();

		this.setDebugService( this.tool.toolDebugger );

		this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );

		this.selectionService.registerStrategy( PropCurve.name, new ObjectUserDataStrategy<PropCurve>( PropCurve.tag, 'curve' ) );

		this.setTypeName( PropCurve.name );

	}

	private get prop (): PropModel {

		const prop = PropManager.getProp();

		if ( prop ) {

			return new PropModel(
				prop.guid,
				prop.data?.rotationVariance || new Vector3( 0, 0, 0 ),
				prop.data?.scaleVariance || new Vector3( 0, 0, 0 )
			);

		}

	}

	onCreateObject ( e: PointerEventData ) {

		if ( !this.prop ) this.setHint( 'Select a prop from the project browser' );

		if ( !this.prop ) this.setHint( 'Select a prop from the project browser' );

		if ( !this.prop ) return;

		super.onCreateObject( e );

	}

	onObjectSelected ( object: any ) {

		if ( object instanceof SimpleControlPoint ) {

			this.onPointSelected( object )

		} else if ( object instanceof PropCurve ) {

			this.onCurveSelected( object );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof SimpleControlPoint ) {

			this.onPointUnselected( object )

		} else if ( object instanceof PropCurve ) {

			this.onCurveUnselected( object );

		}

	}

	onObjectAdded ( object: any ) {

		if ( object instanceof SimpleControlPoint ) {

			this.addPoint( object.mainObject, object );

		} else if ( object instanceof PropCurve ) {

			this.addCurve( object );

		}

	}


	onObjectRemoved ( object: any ) {

		if ( object instanceof SimpleControlPoint ) {

			this.removePoint( object.mainObject, object );

		} else if ( object instanceof PropCurve ) {

			this.removeCurve( object );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof SimpleControlPoint ) {

			this.updatePoint( object.mainObject, object );

		} else if ( object instanceof PropCurve ) {

			this.updateCurve( object );

		} else if ( object instanceof PropCurveInspector ) {

			this.updateCurve( object.curve );

		}

	}

	private onPointSelected ( object: SimpleControlPoint<PropCurve> ) {

		object.select();

		this.onShowInspector( object.mainObject, object );
	}

	private onPointUnselected ( object: SimpleControlPoint<PropCurve> ) {

		object.unselect();

		this.clearInspector();

	}

	private onCurveSelected ( object: PropCurve ) {

		this.debugService.updateDebugState( object, DebugState.SELECTED );

		this.onShowInspector( object );

	}

	private onCurveUnselected ( object: PropCurve ) {

		this.debugService.updateDebugState( object, DebugState.DEFAULT );

		this.clearInspector();

	}

	protected onShowInspector ( object: any, controlPoint?: AbstractControlPoint ): void {

		this.setInspector( new PropCurveInspector( object, controlPoint ) );

	}

	private addPoint ( curve: PropCurve, point: SimpleControlPoint<PropCurve> ) {

		this.tool.splineService.addControlPoint( curve.spline, point );

		this.tool.service.update( curve );

		this.debugService.updateDebugState( curve, DebugState.SELECTED );

	}

	private removePoint ( curve: PropCurve, point: SimpleControlPoint<PropCurve> ) {

		this.tool.splineService.removeControlPoint( curve.spline, point );

		this.tool.service.update( curve );

		this.debugService.updateDebugState( curve, DebugState.SELECTED );

		// NOTE: not clearing this allows removing same point multiple times
		this.selectionService.clearSelection();

	}

	private updatePoint ( curve: PropCurve, point: SimpleControlPoint<PropCurve> ) {

		curve.spline.update();

		this.tool.service.update( curve );

		this.debugService.updateDebugState( curve, DebugState.SELECTED );

	}

	private addCurve ( curve: PropCurve ) {

		this.tool.service.add( curve );

		this.debugService.updateDebugState( curve, DebugState.SELECTED );

		this.onShowInspector( curve );

	}

	private removeCurve ( curve: PropCurve ) {

		this.tool.service.remove( curve );

		this.debugService.updateDebugState( curve, DebugState.REMOVED );

		this.clearInspector();

	}

	private updateCurve ( curve: PropCurve ) {

		this.tool.service.update( curve );

		this.debugService.updateDebugState( curve, DebugState.SELECTED );

	}


}

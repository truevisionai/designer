/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { PropCurve } from 'app/map/prop-curve/prop-curve.model';
import { PropManager } from 'app/managers/prop-manager';
import { PropModel } from '../../map/prop-point/prop-model.model';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { PropCurveService } from '../../map/prop-curve/prop-curve.service';
import { Vector3 } from 'three';
import { PropCurveInspector } from '../../map/prop-curve/prop-curve.inspector';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';

export class PropCurveTool extends BaseTool<any> {

	public name: string = 'PropCurveTool';

	public toolType = ToolType.PropCurve;

	constructor () {

		super();

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

	onObjectUpdated ( object: any ): void {

		if ( object instanceof PropCurveInspector ) {

			super.onObjectUpdated( object.curve );

		} else {

			super.onObjectUpdated( object );

		}
	}

	protected onShowInspector ( object: any, controlPoint?: AbstractControlPoint ): void {

		this.setInspector( new PropCurveInspector( object, controlPoint ) );

	}

}

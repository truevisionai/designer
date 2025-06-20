/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { FreeValidationCreationStrategy } from 'app/core/interfaces/base-creation-strategy';
import { PointerEventData } from 'app/events/pointer-event-data';
import { PropCurve } from 'app/map/prop-curve/prop-curve.model';
import { PropCurvePoint } from '../objects/prop-curve-point';

@Injectable()
export class PropCurvePointCreator extends FreeValidationCreationStrategy<PropCurvePoint> {

	canCreate ( event: PointerEventData, lastSelected?: PropCurve | PropCurvePoint | null ): boolean {

		return this.getCurve( lastSelected ) !== undefined;

	}

	getCurve ( lastSelected: PropCurve | PropCurvePoint ): PropCurve {

		if ( lastSelected instanceof PropCurve ) {

			return lastSelected;

		} else if ( lastSelected instanceof PropCurvePoint ) {

			return lastSelected.curve;

		}

	}

	createObject ( event: PointerEventData, lastSelected?: PropCurve | PropCurvePoint | null ): PropCurvePoint {

		const curve = this.getCurve( lastSelected );

		const point = new PropCurvePoint( curve );

		point.position.copy( event.point );

		return point;

	}

}

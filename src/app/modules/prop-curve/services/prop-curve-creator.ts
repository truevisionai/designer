import { Injectable } from '@angular/core';
import { FreeValidationCreationStrategy } from 'app/core/interfaces/base-creation-strategy';
import { ValidationFailed, ValidationPassed, ValidationResult } from 'app/core/interfaces/creation-strategy';
import { PointerEventData } from 'app/events/pointer-event-data';
import { PropManager } from 'app/managers/prop-manager';
import { PropCurve } from 'app/map/prop-curve/prop-curve.model';
import { PropModel } from 'app/map/prop-point/prop-model.model';
import { Vector3 } from 'app/core/maths';
import { PropCurvePoint } from '../objects/prop-curve-point';

@Injectable()
export class PropCurveCreator extends FreeValidationCreationStrategy<PropCurve> {

	getPropModel (): PropModel {

		const prop = PropManager.getProp();

		if ( prop ) {

			return new PropModel(
				prop.guid,
				prop.data?.rotationVariance || new Vector3( 0, 0, 0 ),
				prop.data?.scaleVariance || new Vector3( 0, 0, 0 )
			);

		}

	}

	validate ( event: PointerEventData, lastSelected?: any ): ValidationResult {

		if ( !this.getPropModel() ) {
			return new ValidationFailed( 'Select a prop from the project browser' );
		}

		return new ValidationPassed();

	}

	canCreate ( event: PointerEventData, lastSelected?: PropCurve | PropCurvePoint | null ): boolean {

		return lastSelected === null;

	}

	createObject ( event: PointerEventData, lastSelected?: PropCurve | PropCurvePoint | null ): PropCurve {

		const prop = this.getPropModel();

		const curve = new PropCurve( prop.guid );

		const point = new PropCurvePoint( curve );

		point.position.copy( event.point );

		curve.spline.addControlPoint( point );

		return curve;

	}

}

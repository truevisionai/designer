/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { PointController } from 'app/core/controllers/point-controller';
import { PropCurveService } from '../services/prop-curve.service';
import { PropCurveInspector } from '../inspectors/prop-curve.inspector';
import { PropCurvePoint } from '../objects/prop-curve-point';

@Injectable()
export class PropCurvePointController extends PointController<PropCurvePoint> {

	constructor ( private service: PropCurveService ) {

		super();

	}

	showInspector ( point: PropCurvePoint ): void {

		this.setInspector( new PropCurveInspector( point.curve, point ) );

	}

	onAdded ( point: PropCurvePoint ): void {

		if ( point.index ) {

			point.curve.spline.insertControlPoint( point.index, point );

		} else {

			point.curve.spline.addControlPoint( point );

		}

		this.service.update( point.curve );

	}

	onUpdated ( point: PropCurvePoint ): void {

		this.service.update( point.curve );

	}

	onRemoved ( point: PropCurvePoint ): void {

		point.curve.spline.removeControlPoint( point );

		this.service.update( point.curve );

	}

}

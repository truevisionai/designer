/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseController } from 'app/core/controllers/base-controller';
import { PropCurve } from 'app/map/prop-curve/prop-curve.model';
import { PropCurveService } from '../services/prop-curve.service';
import { PropCurveInspector } from '../inspectors/prop-curve.inspector';

@Injectable()
export class PropCurveController extends BaseController<PropCurve> {

	constructor ( private service: PropCurveService ) {

		super();

	}

	onAdded ( object: PropCurve ): void {

		this.service.add( object );

	}

	onUpdated ( object: PropCurve ): void {

		this.service.update( object );

	}

	onRemoved ( object: PropCurve ): void {

		this.service.remove( object );

	}

	showInspector ( object: PropCurve ): void {

		this.setInspector( new PropCurveInspector( object ) );

	}

}

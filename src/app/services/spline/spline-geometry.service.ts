/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { SplineBuilder } from './spline.builder';

@Injectable( {
	providedIn: 'root'
} )
export class SplineGeometryService {

	constructor ( private splineBuilder: SplineBuilder ) { }

	updateGeometryAndBounds ( spline: AbstractSpline ): void {

		if ( spline.getControlPointCount() < 2 ) {

			this.splineBuilder.removeGeometry( spline );

			return;

		}

		this.splineBuilder.buildGeometry( spline );

		this.splineBuilder.updateBounds( spline );

	}


}


/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { SplineGeometryGenerator } from './spline-geometry-generator';

@Injectable( {
	providedIn: 'root'
} )
export class SplineGeometryService {

	constructor ( private splineBuilder: SplineGeometryGenerator ) { }

	updateGeometryAndBounds ( spline: AbstractSpline ): void {

		if ( spline.getControlPointCount() < 2 ) {

			this.splineBuilder.removeGeometry( spline );

			return;

		}

		this.updateGeometry( spline );

		this.splineBuilder.updateBounds( spline );

	}


	updateGeometry ( spline: AbstractSpline ): void {

		if ( spline.getControlPointCount() < 2 ) {

			this.splineBuilder.removeGeometry( spline );

			return;

		}

		this.splineBuilder.buildGeometry( spline );

	}


}


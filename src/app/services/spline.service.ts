import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Object3DArrayMap } from 'app/tools/lane-width/object-3d-map';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';

@Injectable( {
	providedIn: 'root'
} )
export class SplineService {

	private pointMap = new Object3DArrayMap<AbstractSpline, AbstractControlPoint[]>();

	constructor () { }

	show ( spline: AbstractSpline ) {

		spline.showLines();

	}

	hide ( spline: AbstractSpline ) {

		spline.hideLines();

	}

	showControlPoints ( spline: AbstractSpline ) {

		spline.controlPoints.forEach( point => {

			this.pointMap.addItem( spline, point );

		} );

	}

	addControlPoint ( spline: AbstractSpline, point: AbstractControlPoint ) {

		spline.addControlPoint( point );

		this.pointMap.addItem( spline, point );

	}

	removeControlPoint ( spline: AbstractSpline, point: AbstractControlPoint ) {

		spline.removeControlPoint( point );

		this.pointMap.removeItem( spline, point );

	}

	hideControlPoints ( spline: AbstractSpline ) {

		spline.controlPoints.forEach( point => {

			this.pointMap.removeItem( spline, point );

		} );

	}

}

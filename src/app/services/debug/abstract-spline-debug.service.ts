import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Object3DArrayMap } from 'app/tools/lane-width/object-3d-map';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';

@Injectable( {
	providedIn: 'root'
} )
export class AbstractSplineDebugService {

	private pointMap = new Object3DArrayMap<AbstractSpline, AbstractControlPoint[]>();

	constructor () { }

	show ( spline: AbstractSpline ) {

		spline.show();

	}

	hide ( spline: AbstractSpline ) {

		spline.hide();

	}

	showLines ( spline: AbstractSpline ) {

		spline.showLines();

	}

	hideLines ( spline: AbstractSpline ) {

		spline.hideLines();

	}

	showControlPoints ( spline: AbstractSpline ) {

		spline.controlPoints.forEach( point => {

			this.pointMap.addItem( spline, point );

			if ( point instanceof RoadControlPoint ) {

				this.pointMap.addItem( spline, point.frontTangent )

				this.pointMap.addItem( spline, point.backTangent )

				this.pointMap.addItem( spline, point.tangentLine )

			}

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

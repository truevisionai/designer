/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { MapService } from 'app/services/map/map.service';
import { PropModel } from 'app/core/models/prop-model.model';
import { PropCurve } from 'app/map/models/prop-curve';
import { Object3D, Vector3 } from 'three';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { SimpleControlPoint } from 'app/objects/dynamic-control-point';
import { AbstractSplineDebugService } from 'app/services/debug/abstract-spline-debug.service';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { Object3DMap } from '../../core/models/object3d-map';
import { PropCurveBuilder } from './prop-curve.builder';
import { Object3DArrayMap } from "../../core/models/object3d-array-map";

@Injectable( {
	providedIn: 'root'
} )
export class PropCurveService {

	private points = new Object3DArrayMap<AbstractSpline, AbstractControlPoint[]>();
	private lines = new Object3DMap<PropCurve, Object3D>();

	constructor (
		public base: BaseToolService,
		private mapService: MapService,
		private splineService: AbstractSplineDebugService,
		private controlPointFactory: ControlPointFactory,
		private builder: PropCurveBuilder,
	) {
	}

	addPropCurve ( curve: PropCurve ) {

		this.mapService.map.propCurves.push( curve );

		this.splineService.showLines( curve.spline );

		this.splineService.showControlPoints( curve.spline );

	}

	removePropCurve ( curve: PropCurve ) {

		const index = this.mapService.map.propCurves.indexOf( curve );

		if ( index > -1 ) {

			this.mapService.map.propCurves.splice( index, 1 );

			this.splineService.hideLines( curve.spline );

			this.splineService.hideControlPoints( curve.spline );

		} else {

			console.warn( 'PropCurve not found' );

		}

	}

	addPropCurvePoint ( curve: PropCurve, point: SimpleControlPoint<PropCurve> ) {

		this.splineService.addControlPoint( curve.spline, point );

		this.updateCurve( curve );
	}

	updateCurve ( curve: PropCurve ) {

		this.builder.buildPropCurbe( curve );

	}

	removePropCurvePoint ( curve: PropCurve, point: SimpleControlPoint<PropCurve> ) {

		this.splineService.removeControlPoint( curve.spline, point );

		this.updateCurve( curve );

	}

	hidePropCurves () {

		this.mapService.map.propCurves.forEach( curve => {

			curve.spline.hide();

			this.lines.remove( curve );

			this.points.removeKey( curve.spline );

		} );

	}

	showPropCurves () {

		this.mapService.map.propCurves.forEach( curve => {

			curve.spline.show();

			this.lines.add( curve, curve.spline.mesh );

			curve.spline.controlPoints.forEach( point => {

				this.points.addItem( curve.spline, point )

			} );

		} );

	}

	createPropCurve ( prop: PropModel, position: Vector3 ) {

		return new PropCurve( prop.guid );

	}

	createCurvePoint ( propCurve: PropCurve, position: Vector3 ) {

		return this.controlPointFactory.createSimpleControlPoint( propCurve, position );

	}

}

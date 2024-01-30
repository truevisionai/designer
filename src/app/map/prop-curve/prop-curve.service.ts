/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapService } from 'app/services/map/map.service';
import { PropCurve } from 'app/map/prop-curve/prop-curve.model';
import { PropCurveBuilder } from './prop-curve.builder';
import { DataService } from 'app/services/debug/data.service';

@Injectable( {
	providedIn: 'root'
} )
export class PropCurveService extends DataService<PropCurve> {

	constructor (
		private mapService: MapService,
		private builder: PropCurveBuilder,
	) {
		super();
	}

	all (): PropCurve[] {

		return this.mapService.map.propCurves;

	}

	add ( curve: PropCurve ) {

		this.mapService.map.propCurves.push( curve );

		this.build( curve );

	}

	remove ( curve: PropCurve ) {

		const index = this.mapService.map.propCurves.indexOf( curve );

		if ( index > -1 ) {

			this.mapService.map.propCurves.splice( index, 1 );

		}

		this.mapService.map.propCurvesGroup.remove( curve );
	}

	update ( curve: PropCurve ) {

		this.build( curve );

	}

	private build ( curve: PropCurve ) {

		if ( curve.spline.controlPoints.length < 2 ) return;

		this.mapService.map.propCurvesGroup.add( curve, this.builder.build( curve ) );

	}

}

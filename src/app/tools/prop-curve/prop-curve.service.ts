import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { MapService } from 'app/services/map.service';
import { PropModel } from 'app/core/models/prop-model.model';
import { PropCurve } from 'app/modules/tv-map/models/prop-curve';
import { Object3D, Vector3 } from 'three';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { SplineService } from 'app/services/spline.service';
import { SceneService } from 'app/services/scene.service';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { Maths } from 'app/utils/maths';
import { SelectionService } from '../selection.service';

@Injectable( {
	providedIn: 'root'
} )
export class PropCurveService {

	// private pointMap = new Object3DArrayMap<AbstractSpline, AbstractControlPoint[]>();

	constructor (
		public base: BaseToolService,
		private mapService: MapService,
		private splineService: SplineService,
		private controlPointFactory: ControlPointFactory,
		public selection: SelectionService
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

	addPropCurvePoint ( curve: PropCurve, point: DynamicControlPoint<PropCurve> ) {

		this.splineService.addControlPoint( curve.spline, point );

		this.updateCurve( curve );
	}

	updateCurve ( curve: PropCurve ) {

		curve.spline.update();

		curve.props.forEach( prop => SceneService.removeFromMain( prop ) );

		if ( curve.spline.controlPoints.length < 2 ) return;

		const length = curve.spline.getLength();

		if ( length <= 0 ) return;

		curve.props.forEach( prop => SceneService.removeFromMain( prop ) );

		curve.props.splice( 0, curve.props.length );

		const spline = curve.spline;

		const prop = AssetDatabase.getInstance<Object3D>( curve.propGuid );

		for ( let i = 0; i < length; i += curve.spacing ) {

			const t = spline.curve.getUtoTmapping( 0, i );

			const point = spline.curve.getPoint( t );

			const clone = prop.clone();

			// apply random position variance
			const position = new Vector3(
				point.x + Maths.randomFloatBetween( -curve.positionVariance, curve.positionVariance ),
				point.y + Maths.randomFloatBetween( -curve.positionVariance, curve.positionVariance ),
				point.z + 0,
			);

			// apply random rotation variance
			const rotation = new Vector3(
				clone.rotation.x + Maths.randomFloatBetween( -curve.rotation, curve.rotation ),
				clone.rotation.y + Maths.randomFloatBetween( -curve.rotation, curve.rotation ),
				clone.rotation.z + Maths.randomFloatBetween( -curve.rotation, curve.rotation ),
			);

			curve.addProp( clone, position, rotation, clone.scale );

			curve.props.push( clone );

		}


		curve.props.forEach( prop => SceneService.addToMain( prop ) );

	}

	removePropCurvePoint ( curve: PropCurve, point: DynamicControlPoint<PropCurve> ) {

		this.splineService.removeControlPoint( curve.spline, point );

		this.updateCurve( curve );

	}

	hidePropCurves () {

		this.mapService.map.propCurves.forEach( curve => curve.hide() );

	}

	showPropCurves () {

		this.mapService.map.propCurves.forEach( curve => curve.show() );

	}

	createPropCurve ( prop: PropModel, position: Vector3 ) {

		return new PropCurve( prop.guid );

	}

	createCurvePoint ( propCurve: PropCurve, position: Vector3 ) {

		return this.controlPointFactory.createDynamic( propCurve, position );

	}

}

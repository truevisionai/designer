import { Injectable } from "@angular/core";
import { AssetDatabase } from "app/core/asset/asset-database";
import { PropCurve } from "app/modules/tv-map/models/prop-curve";
import { SceneService } from "app/services/scene.service";
import { Maths } from "app/utils/maths";
import { Object3D, Vector3 } from "three";

@Injectable( {
	providedIn: 'root'
} )
export class PropCurveBuilder {

	constructor () { }

	buildPropCurbe ( curve: PropCurve ) {

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

}

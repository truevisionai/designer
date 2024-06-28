/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PropCurve } from "app/map/prop-curve/prop-curve.model";
import { Maths } from "app/utils/maths";
import { Group, Object3D, Vector3 } from "three";
import { MeshBuilder } from "../../core/interfaces/mesh.builder";
import { CatmullRomSpline } from "../../core/shapes/catmull-rom-spline";
import { AssetService } from "app/core/asset/asset.service";
import { Asset, AssetType } from "app/core/asset/asset.model";
import { SplineBuilder } from "../../services/spline/spline.builder";

@Injectable( {
	providedIn: 'root'
} )
export class PropCurveBuilder extends MeshBuilder<PropCurve> {

	constructor (
		private assetService: AssetService,
		private splineBuilder: SplineBuilder,
	) {
		super();
	}

	build ( curve: PropCurve ): Object3D {

		const group = new Group();

		if ( curve.spline.controlPoints.length < 2 ) return;

		this.splineBuilder.buildSpline( curve.spline );

		if ( curve.spline.getLength() <= 0 ) return;

		curve.props.splice( 0, curve.props.length );

		const assetGuid = curve.propGuid;

		if ( !assetGuid ) return;

		const asset = this.assetService.getAsset( assetGuid );

		if ( !asset ) return;

		this.placeProps( curve, curve.spline as CatmullRomSpline, group, asset );

		return group;
	}

	private placeProps ( curve: PropCurve, spline: CatmullRomSpline, group: Group, asset: Asset ) {

		const prop = this.getProp( asset );

		if ( !prop ) return;

		for ( let i = 0; i < spline.getLength(); i += curve.spacing ) {

			const t = spline.curve.getUtoTmapping( 0, i );

			const point = spline.curve.getPoint( t );

			const clone = prop.clone();

			// apply random position variance
			const position = new Vector3(
				point.x + Maths.randomFloatBetween( -curve.positionVariance, curve.positionVariance ),
				point.y + Maths.randomFloatBetween( -curve.positionVariance, curve.positionVariance ),
				point.z,
			);

			// apply random rotation variance
			const rotation = new Vector3(
				clone.rotation.x + Maths.randomFloatBetween( -curve.rotation, curve.rotation ),
				clone.rotation.y + Maths.randomFloatBetween( -curve.rotation, curve.rotation ),
				clone.rotation.z + Maths.randomFloatBetween( -curve.rotation, curve.rotation ),
			);

			curve.addProp( clone, position, rotation, clone.scale );

			curve.props.push( clone );

			group.add( clone );

		}

	}

	private getProp ( asset: Asset ): Object3D {

		let prop: Object3D;

		if ( asset.type == AssetType.OBJECT ) {

			prop = this.assetService.getObjectAsset( asset.guid )?.instance;

		} else if ( asset.type == AssetType.MODEL ) {

			prop = this.assetService.getModelAsset( asset.guid );

		}

		return prop;
	}
}

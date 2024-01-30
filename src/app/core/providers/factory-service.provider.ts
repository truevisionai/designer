/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ToolType } from 'app/tools/tool-types.enum';
import { SurfaceFactory } from "../../map/surface/surface.factory";
import { AbstractFactory } from "../interfaces/abstract-factory";
import { PropPolygonFactory } from "../../map/prop-polygon/prop-polygon.factory";
import { PropCurveFactory } from "../../map/prop-curve/prop-curve.factory";
import { PropPointFactory } from "../../map/prop-point/prop-point.factory";
import { AssetManager } from "../asset/asset.manager";

@Injectable( {
	providedIn: 'root'
} )
export class FactoryServiceProvider {

	constructor (
		private assetManager: AssetManager
	) {
	}

	createFromToolType ( type: ToolType ): AbstractFactory<any> {

		let factory: AbstractFactory<any>;

		switch ( type ) {
			case ToolType.Surface:
				factory = new SurfaceFactory();
				break;

			case ToolType.PropPoint:
				factory = new PropPointFactory();
				break;

			case ToolType.PropPolygon:
				factory = new PropPolygonFactory();
				break;

			case ToolType.PropCurve:
				factory = new PropCurveFactory();
				break;

			default:
				return;
				break;
		}

		if ( !factory ) return;

		factory.setAssetManager( this.assetManager );

		return factory;
	}

}

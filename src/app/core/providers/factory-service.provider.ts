/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ToolType } from 'app/tools/tool-types.enum';
import { SurfaceFactory } from "../../map/surface/surface.factory";
import { AbstractFactory } from "../interfaces/abstract-factory";
import { ILaneNodeFactory } from "../interfaces/lane-element.factory";
import { PropPolygonFactory } from "../../map/prop-polygon/prop-polygon.factory";
import { PropCurveFactory } from "../../map/prop-curve/prop-curve.factory";
import { PropPointFactory } from "../../map/prop-point/prop-point.factory";
import { AssetManager } from "../../assets/asset.manager";
import { LaneHeightFactory } from 'app/map/lane-height/lane-height.factory';
import { AssetService } from '../../assets/asset.service';

@Injectable( {
	providedIn: 'root'
} )
export class FactoryServiceProvider {

	constructor (
		private assetManager: AssetManager,
		private assetService: AssetService,
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

		factory.setAssetService( this.assetService );

		return factory;
	}


	createForLaneTool ( type: ToolType ): ILaneNodeFactory<any> {

		let factory: ILaneNodeFactory<any>;

		switch ( type ) {
			case ToolType.LaneHeight:
				factory = new LaneHeightFactory();
				break;

			default:
				return;
				break;
		}

		return factory;
	}

}

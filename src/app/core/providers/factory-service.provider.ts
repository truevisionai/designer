/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ToolType } from 'app/tools/tool-types.enum';
import { AbstractFactory } from "../interfaces/abstract-factory";
import { ILaneNodeFactory } from "../interfaces/lane-element.factory";
import { PropPolygonFactory } from "../../map/prop-polygon/prop-polygon.factory";
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
			case ToolType.PropPoint:
				factory = new PropPointFactory();
				break;

			case ToolType.PropPolygon:
				factory = new PropPolygonFactory();
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

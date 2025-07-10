/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable, Injector } from '@angular/core';
import { AssetType } from "../assets/asset.model";
import { AssetLoader } from "../core/interfaces/asset.loader";
import { TvMaterialLoader } from "../assets/material/tv-material.loader";
import { TvObjectLoader } from "../assets/object/tv-object.loader";
import { SceneLoader } from "../map/scene/scene.loader";
import { TvTextureLoader } from "../assets/texture/tv-texture.loader";
import { RoadStyleLoader } from "../assets/road-style/road-style.loader";
import { PointCloudLoader } from 'app/assets/point-cloud/point-cloud-loader';


@Injectable( {
	providedIn: 'root'
} )
export class LoaderFactory {

	constructor (
		private injector: Injector
	) {
	}

	// eslint-disable-next-line max-lines-per-function
	getLoader ( type: AssetType ): AssetLoader {

		let loader: AssetLoader;

		switch ( type ) {

			case AssetType.DIRECTORY:
				break;

			case AssetType.FILE:
				break;

			case AssetType.MATERIAL:
				loader = this.injector.get( TvMaterialLoader );
				break;

			case AssetType.MODEL:
				loader = this.injector.get( TvObjectLoader );
				break;

			case AssetType.MESH:
				break;

			case AssetType.SCENE:
				loader = this.injector.get( SceneLoader );
				break;

			case AssetType.ROAD_SIGN:
				break;

			case AssetType.ENTITY:
				break;

			case AssetType.OPENDRIVE:
				break;

			case AssetType.OPENSCENARIO:
				break;

			case AssetType.PREFAB:
				break;

			case AssetType.TEXTURE:
				loader = this.injector.get( TvTextureLoader );
				break;

			case AssetType.OBJECT:
				loader = this.injector.get( TvObjectLoader );
				break;

			case AssetType.GEOMETRY:
				break;

			case AssetType.ROAD_MARKING:
				break;

			case AssetType.ROAD_STYLE:
				loader = this.injector.get( RoadStyleLoader );
				break;

			case AssetType.POINT_CLOUD:
				loader = this.injector.get( PointCloudLoader );
				break;

			default:
				console.error( 'Loader not found for assets type', type );
				break;

		}

		return loader;

	}

}

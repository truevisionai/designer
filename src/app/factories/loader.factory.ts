/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable, Injector } from '@angular/core';
import { AssetType } from "../core/asset/asset.model";
import { TvMaterialLoader } from "../graphics/material/tv-material.loader";
import { TvTextureLoader } from "../graphics/texture/tv-texture.loader";
import { TvObjectLoader } from "../graphics/object/tv-object.loader";
import { AssetLoader } from "../core/interfaces/asset.loader";
import { RoadStyleLoader } from "../graphics/road-style/road-style.loader";
import { SceneLoader } from 'app/map/scene/scene.loader';


@Injectable( {
	providedIn: 'root'
} )
export class LoaderFactory {

	constructor (
		private injector: Injector
	) {
	}

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

			default:
				console.error( 'Loader not found for asset type', type );
				break;

		}

		return loader;

	}

}

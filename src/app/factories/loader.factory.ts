/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
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
		private materialLoader: TvMaterialLoader,
		private textureLoader: TvTextureLoader,
		private objectLoader: TvObjectLoader,
		private roadStyleLoader: RoadStyleLoader,
		private sceneLoader: SceneLoader,
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
				loader = this.materialLoader;
				break;

			case AssetType.MODEL:
				loader = this.objectLoader;
				break;

			case AssetType.MESH:
				break;

			case AssetType.SCENE:
				loader = this.sceneLoader;
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
				loader = this.textureLoader;
				break;

			case AssetType.OBJECT:
				loader = this.objectLoader;
				break;

			case AssetType.GEOMETRY:
				break;

			case AssetType.ROAD_MARKING:
				break;

			case AssetType.ROAD_STYLE:
				loader = this.roadStyleLoader;
				break;

			default:
				console.error( 'Loader not found for asset type', type );
				break;

		}

		return loader;

	}

}

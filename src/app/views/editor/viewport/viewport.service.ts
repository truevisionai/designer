/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { DragDropData } from 'app/services/editor/drag-drop.service';
import { ToolManager } from 'app/managers/tool-manager';
import { TvSceneFileService } from 'app/services/tv-scene-file.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { Vector3 } from 'three';
import { Asset, AssetType } from 'app/assets/asset.model';
import { LoaderFactory } from 'app/factories/loader.factory';
import { TvMap } from 'app/map/models/tv-map.model';

@Injectable( {
	providedIn: 'root'
} )
export class ViewportService {

	constructor (
		private loaderFactory: LoaderFactory,
		private sceneFileService: TvSceneFileService,
		private snackBar: SnackBar
	) {
	}

	async handleAssetDropped ( asset: DragDropData, position: Vector3 ) {

		const type = asset?.type;

		if ( !type ) {
			console.error( 'Asset type not found', asset, position );
			this.snackBar.warn( `File not supported for viewport extension: ${ asset?.extension } ` + asset?.path );
			return;
		}

		switch ( asset?.type ) {

			case AssetType.OPENDRIVE:
				this.loadOpenDrive( asset );
				break;

			case AssetType.SCENE:
				this.loadScene( asset );
				break;

			case AssetType.PREFAB:
				this.importAsset( asset, position );
				break;

			case AssetType.OBJECT:
				this.importAsset( asset, position );
				break;

			case AssetType.GEOMETRY:
				this.importAsset( asset, position );
				break;

			case AssetType.MODEL:
				this.importAsset( asset, position );
				break;

			case AssetType.TEXTURE:
				this.importAsset( asset, position );
				break;

			case AssetType.ROAD_STYLE:
				this.importAsset( asset, position );
				break;

			case AssetType.MATERIAL:
				this.importAsset( asset, position );
				break;

			default:
				break;
		}

	}

	loadScene ( asset: Asset ) {

		const assetLoader = this.loaderFactory.getLoader( AssetType.SCENE );

		const map = assetLoader.load( asset ) as TvMap;

		this.sceneFileService.setMap( map );

		this.sceneFileService.setFilePath( asset.path, map );

	}

	loadOpenDrive ( asset: Asset ) {

		const assetLoader = this.loaderFactory.getLoader( AssetType.OPENDRIVE )

		const map = assetLoader.load( asset ) as TvMap;

		this.sceneFileService.setMap( map );

	}

	importAsset ( asset: Asset, position: Vector3 ) {

		ToolManager.currentTool?.onAssetDropped( asset, position );

	}

}

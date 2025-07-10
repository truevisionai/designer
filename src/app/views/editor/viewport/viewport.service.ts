/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { DragDropData } from 'app/services/editor/drag-drop.service';
import { ToolManager } from 'app/managers/tool-manager';
import { TvSceneFileService } from 'app/services/tv-scene-file.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { Asset, AssetType } from 'app/assets/asset.model';
import { LoaderFactory } from 'app/factories/loader.factory';
import { TvMap } from 'app/map/models/tv-map.model';
import { PointerEventData } from 'app/events/pointer-event-data';
import { SceneService } from 'app/services/scene.service';
import { PointCloudAsset } from 'app/assets/point-cloud/point-cloud-asset';

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

	async handleAssetDropped ( asset: DragDropData, event: PointerEventData ): Promise<void> {

		const type = asset?.type;

		if ( !type ) {
			console.error( 'Asset type not found', asset, event.point );
			this.snackBar.warn( `File not supported for viewport extension: ${ asset?.extension } ${ asset?.path }` );
			return;
		}

		switch ( asset?.type ) {

			case AssetType.OPENDRIVE:
				this.loadOpenDrive( asset );
				break;

			case AssetType.SCENE:
				this.loadScene( asset );
				break;

			case AssetType.POINT_CLOUD:
				this.loadPointCloud( asset );
				break;

			default:
				this.importAsset( asset, event );
				break;
		}

	}

	loadPointCloud ( asset: Asset ): void {

		const assetLoader = this.loaderFactory.getLoader( AssetType.POINT_CLOUD );

		const pointCloudAsset = assetLoader.load( asset ) as PointCloudAsset;

		if ( pointCloudAsset && pointCloudAsset.object3D ) {

			SceneService.addToMain( pointCloudAsset.object3D, false );

			this.snackBar.success( `Point cloud loaded: ${ pointCloudAsset.name }` );

		} else {

			this.snackBar.error( `Failed to load point cloud: ${ asset.name }` );

		}

	}

	loadScene ( asset: Asset ): void {

		const assetLoader = this.loaderFactory.getLoader( AssetType.SCENE );

		const map = assetLoader.load( asset ) as TvMap;

		this.sceneFileService.setMap( map );

		this.sceneFileService.setFilePath( asset.path, map );

	}

	loadOpenDrive ( asset: Asset ): void {

		const assetLoader = this.loaderFactory.getLoader( AssetType.OPENDRIVE )

		const map = assetLoader.load( asset ) as TvMap;

		this.sceneFileService.setMap( map );

	}

	importAsset ( asset: Asset, event: PointerEventData ): void {

		ToolManager.onAssetDropped( asset, event );

	}

}

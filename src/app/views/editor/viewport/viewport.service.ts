/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { DragDropData } from 'app/services/editor/drag-drop.service';
import { ToolManager } from 'app/managers/tool-manager';
import { ImporterService } from 'app/importers/importer.service';
import { TvSceneFileService } from 'app/services/tv-scene-file.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { Vector3 } from 'three';
import { AssetNode, AssetType } from 'app/views/editor/project-browser/file-node.model';

@Injectable( {
	providedIn: 'root'
} )
export class ViewportService {

	constructor (
		private importerService: ImporterService,
		private mainFileService: TvSceneFileService,
		private snackBar: SnackBar
	) {
	}

	handleAssetDropped ( asset: DragDropData, position: Vector3 ) {

		switch ( asset?.type ) {

			case AssetType.OPENDRIVE:
				this.importOpenDrive( asset.path );
				break;

			case AssetType.OPENSCENARIO:
				this.importerService.importOpenScenario( asset.path );
				break;

			case AssetType.SCENE:
				this.importerService.importScene( asset.path );
				break;

			case AssetType.PREFAB:
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
				this.snackBar.warn( `File not supported for viewport extension: ${ asset.extension } ` + asset.path );
				break;
		}

	}

	importOpenDrive ( path: string ) {

		this.mainFileService.newScene();

		this.importerService.importOpenDrive( path );

	}

	importAsset ( asset: AssetNode, position: Vector3 ) {

		ToolManager.currentTool?.onAssetDropped( asset, position );

	}

}

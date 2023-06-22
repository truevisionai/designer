/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { PropPointTool } from 'app/core/tools/prop-point/prop-point-tool';
import { ToolManager } from 'app/core/tools/tool-manager';
import { ScenarioInstance } from 'app/modules/scenario/services/scenario-instance';
import { TvMapService } from 'app/modules/tv-map/services/tv-map.service';

import { Vector3 } from 'three';
import { OpenScenarioImporter } from '../modules/scenario/services/tv-reader.service';
import { AssetLoaderService } from './asset-loader.service';
import { FileExtension, FileService } from './file.service';
import { ModelImporterService } from './model-importer.service';
import { PropManager } from './prop-manager';
import { SceneImporterService } from './scene-importer.service';
import { SnackBar } from './snack-bar.service';

@Injectable( {
	providedIn: 'root'
} )
export class ImporterService {

	/**
	 * This class is responsible for importing all supported files
	 **/
	constructor (
		private od: TvMapService,
		private sceneImporter: SceneImporterService,
		private modelImporter: ModelImporterService,
		private assetService: AssetLoaderService,
		private fileService: FileService,
		private openScenarioImporter: OpenScenarioImporter,
		private scenarioInstance: ScenarioInstance,		// dont remove required for import
	) {
	}

	onViewPortFileDropped ( path: string, filename?: string, position?: Vector3 ) {

		const extension = FileService.getExtension( path );

		const metadata = this.assetService.fetchMetaFile( path );

		switch ( extension ) {

			case 'xodr':
				this.importOpenDrive( path );
				break;

			case FileExtension.OPENSCENARIO:
				this.importOpenScenario( path );
				break;

			case 'gltf':
				this.modelImporter.import( path, filename, extension, position, metadata );
				break;

			case 'glb':

				PropManager.setProp( metadata );

				if ( ToolManager.currentTool instanceof PropPointTool ) {

					ToolManager.currentTool.shapeEditor.addControlPoint( position );

				} else {

					ToolManager.currentTool = new PropPointTool();

					( ToolManager.currentTool as PropPointTool ).shapeEditor.addControlPoint( position );

				}

				// this.modelImporter.import( path, filename, extension, position, metadata );

				break;

			case 'obj':
				this.modelImporter.import( path, filename, extension, position, metadata );
				break;

			case 'fbx':
				this.modelImporter.import( path, filename, extension, position, metadata );
				break;

			case 'prop':
				// alert( 'import prop ' + path );
				break;

			case 'scene':
				this.importScene( path );
				break;

			case 'roadstyle':
				console.error( 'method not implemented' );
				break;

			default:
				console.error( `unknown file type: ${ extension }`, path );
				SnackBar.warn( 'Unknown file! Not able to import' );
				break;
		}

	}

	importOpenScenario ( path: string ) {

		ScenarioInstance.loadInstanceFromPath( path );

	}


	importScene ( path: string ) {

		this.sceneImporter.importFromPath( path );

	}

	importOpenDrive ( filepath: string ) {

		this.od.importFromPath( filepath );

	}


}

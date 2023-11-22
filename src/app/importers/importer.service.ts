/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ScenarioService } from 'app/modules/scenario/services/scenario.service';
import { TvMapService } from 'app/modules/tv-map/services/tv-map.service';

import { Vector3 } from 'three';
import { AssetLoaderService } from '../core/asset/asset-loader.service';
import { FileService } from '../io/file.service';
import { OpenScenarioLoader } from '../modules/scenario/services/open-scenario.loader';
import { ModelImporterService } from './model-importer.service';
import { SceneImporterService } from './scene-importer.service';

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
		private openScenarioImporter: OpenScenarioLoader,
		private scenarioInstance: ScenarioService,		// dont remove required for import
	) {
	}

	/**
	 *
	 * @param path
	 * @param filename
	 * @param position
	 * @deprecated
	 */
	async onViewPortFileDropped ( path: string, filename?: string, position?: Vector3 ) {

		throw new Error( 'method not implemented' );

		// const extension = FileService.getExtension( path );

		// const metadata = this.assetService.fetchMetaFile( path );

		// switch ( extension ) {

		// 	case 'xodr':
		// 		this.importOpenDrive( path );
		// 		break;

		// 	case FileExtension.OPENSCENARIO:
		// 		await this.importOpenScenario( path );
		// 		break;

		// 	case 'gltf':
		// 		this.modelImporter.import( path, filename, extension, position, metadata );
		// 		break;

		// 	case 'glb':

		// 		PropManager.setProp( metadata );

		// 		if ( ToolManager.currentTool instanceof PropPointTool ) {

		// 			ToolManager.currentTool.shapeEditor.addControlPoint( position );

		// 		} else {

		// 			ToolManager.currentTool = new PropPointTool();

		// 			( ToolManager.currentTool as PropPointTool ).shapeEditor.addControlPoint( position );

		// 		}

		// 		// this.modelImporter.import( path, filename, extension, position, metadata );

		// 		break;

		// 	case 'obj':
		// 		this.modelImporter.import( path, filename, extension, position, metadata );
		// 		break;

		// 	case 'fbx':
		// 		this.modelImporter.import( path, filename, extension, position, metadata );
		// 		break;

		// 	case 'prop':
		// 		// alert( 'import prop ' + path );
		// 		break;

		// 	case 'scene':
		// 		this.importScene( path );
		// 		break;

		// 	case 'roadstyle':
		// 		console.error( 'method not implemented' );
		// 		break;

		// 	default:
		// 		console.error( `unknown file type: ${ extension }`, path );
		// 		SnackBar.warn( 'Unknown file! Not able to import' );
		// 		break;
		// }

	}

	async importOpenScenario ( path: string ) {

		await ScenarioService.importScenario( path );

	}


	importScene ( path: string ) {

		this.sceneImporter.importFromPath( path );

	}

	importOpenDrive ( filepath: string ) {

		this.od.importFromPath( filepath );

	}


}

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ScenarioService } from 'app/modules/scenario/services/scenario.service';
import { OpenDriveService } from 'app/modules/tv-map/services/open-drive.service';

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
		private openDriveService: OpenDriveService,
		private sceneImporter: SceneImporterService,
		private modelImporter: ModelImporterService,
		private assetService: AssetLoaderService,
		private fileService: FileService,
		private openScenarioImporter: OpenScenarioLoader,
		private scenarioService: ScenarioService,		// dont remove required for import
	) {
	}

	async importOpenScenario ( path: string ) {

		await this.scenarioService.importScenario( path );

	}


	importScene ( path: string ) {

		this.sceneImporter.importFromPath( path );

	}

	importOpenDrive ( filepath: string ) {

		this.openDriveService.importFromPath( filepath );

	}


}

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ScenarioService } from 'app/modules/scenario/services/scenario.service';
import { OpenDriveService } from 'app/modules/tv-map/services/open-drive.service';
import { SceneImporterService } from './scene-importer.service';
import { StorageService } from 'app/io/storage.service';
import { TvSceneFileService } from 'app/services/tv-scene-file.service';

@Injectable( {
	providedIn: 'root'
} )
export class ImporterService {

	/**
	 * This class is responsible for importing all supported files
	 **/
	constructor (
		private storageService: StorageService,
		private openDriveService: OpenDriveService,
		private sceneImporter: SceneImporterService,
		private scenarioService: ScenarioService,		// dont remove required for import
		private sceneFileService: TvSceneFileService,
	) {
	}

	async importOpenScenario ( path: string ) {

		await this.scenarioService.importScenario( path );

	}

	async importScene ( path: string ) {

		this.sceneFileService.openFromPath( path );

	}

	importOpenDrive ( filepath: string ) {

		this.openDriveService.importFromPath( filepath );

	}

}

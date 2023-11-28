/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AppInspector } from 'app/core/inspector';
import { IFile } from 'app/io/file';
import { ToolManager } from 'app/tools/tool-manager';
import { TvConsole } from 'app/core/utils/console';
import { ThreeService } from 'app/modules/three-js/three.service';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-instance';
import { ScenarioService } from '../modules/scenario/services/scenario.service';
import { CommandHistory } from './command-history';
import { SceneImporterService } from '../importers/scene-importer.service';
import { SnackBar } from './snack-bar.service';
import { TvElectronService } from './tv-electron.service';
import { DialogService } from './dialog/dialog.service';
import { MapService } from "./map.service";
import { StorageService } from 'app/io/storage.service';
import { AssetService } from 'app/core/asset/asset.service';
import { FileUtils } from 'app/io/file-utils';
import { ProjectService } from './project.service';

@Injectable( {
	providedIn: 'root'
} )
export class TvSceneFileService {

	constructor (
		private sceneImporter: SceneImporterService,
		private threeService: ThreeService,
		private electronService: TvElectronService,
		private mapService: MapService,
		private dialogService: DialogService,
		private storageService: StorageService,
		private assetService: AssetService,
		private projectService: ProjectService,
	) {
	}

	private get currentFile () {
		return TvMapInstance.currentFile;
	}

	private set currentFile ( value ) {
		TvMapInstance.currentFile = value;
	}

	private get scenario () {
		return ScenarioService.scenario;
	}

	newScene ( map?: TvMap ) {

		this.currentFile = new IFile( 'Untitled.scene' );

		this.electronService.setTitle( this.currentFile.name );

		this.setMap( map || new TvMap() );

	}

	private setMap ( map: TvMap ) {

		this.threeService.reset();

		ToolManager.clear();

		AppInspector.clear();

		CommandHistory.clear();

		this.mapService.map?.destroy();

		this.scenario?.destroy();

		this.mapService.map = map;

		TvMapBuilder.buildMap( this.mapService.map );
	}

	async showOpenWindow ( path?: string ) {

		const response = await this.dialogService.openDialog( {
			path: path,
			extensions: [ 'scene' ],
		} );

		if ( response.canceled ) return;

		if ( response.filePaths == null || response.filePaths.length == 0 ) return;

		this.openFromPath( response.filePaths[ 0 ] );

	}

	async openFromPath ( path: string, callback?: Function ) {

		TvConsole.info( 'Opening file: ' + path );

		const contents = await this.storageService.readAsync( path );

		this.setMap( this.sceneImporter.import( contents ) );

		callback?.();

	}

	async save () {

		if ( this.currentFile == null ) {
			TvConsole.error( 'Create file before saving' );
			return;
		}

		// path exists means it was imported locally
		if ( this.currentFile.path != null ) {

			ToolManager.disable();	// disable tools while saving

			this.saveToPath( this.currentFile.path );

			ToolManager.enable();	// enable tools after saving

		} else {

			this.saveAs();

		}

	}

	async saveAs () {

		ToolManager.disable();	// disable tools while saving

		const options = {
			defaultPath: this.projectService.projectPath,
		}

		const res = await this.dialogService.saveDialog( options );

		if ( res.canceled ) return;

		if ( res.filePath == null ) return;

		this.saveToPath( res.filePath );

		ToolManager.enable();	// enable tools after saving

	}

	private saveToPath ( path: string ) {

		const extension = 'scene';

		// append the extension if not present in the path
		if ( !path.includes( `.${ extension }` ) ) {
			path = path + '.' + extension;
		}

		const directory = FileUtils.getDirectoryFromPath( path );

		const fullName = FileUtils.getFilenameFromPath( path );

		const scene = this.assetService.createSceneAsset( directory, this.mapService.map, fullName );

		this.currentFile.path = scene.path;

		this.currentFile.name = scene.name;

		this.electronService.setTitle( scene.name, scene.path );

		SnackBar.success( 'File Saved!' );

	}

}

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AppInspector } from 'app/core/inspector';
import { IFile } from 'app/io/file';
import { ToolManager } from 'app/managers/tool-manager';
import { TvConsole } from 'app/core/utils/console';
import { ThreeService } from 'app/renderer/three.service';
import { TvMap } from 'app/map/models/tv-map.model';
import { TvMapInstance } from 'app/map/services/tv-map-instance';
import { ScenarioService } from '../scenario/services/scenario.service';
import { CommandHistory } from './command-history';
import { SceneImporterService } from '../importers/scene-importer.service';
import { SnackBar } from './snack-bar.service';
import { TvElectronService } from './tv-electron.service';
import { DialogService } from './dialog/dialog.service';
import { MapService } from "./map/map.service";
import { StorageService } from 'app/io/storage.service';
import { AssetService } from 'app/core/asset/asset.service';
import { FileUtils } from 'app/io/file-utils';
import { ProjectService } from './editor/project.service';
import { SceneBuilderService } from './scene-builder.service';
import { RoadService } from './road/road.service';
import { RoadObjectService } from 'app/map/road-object/road-object.service';

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
		private sceneBuilder: SceneBuilderService,
		private roadService: RoadService,
		private roadObjectService: RoadObjectService,
		private snackBar: SnackBar
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

		console.log( 'setMap', map );

		this.threeService.reset();

		ToolManager.clear();

		AppInspector.clear();

		CommandHistory.clear();

		this.destroyMap( this.mapService.map );

		this.scenario?.destroy();

		this.mapService.map = map;

		this.sceneBuilder.buildScene( map );

	}

	destroyMap ( map: TvMap ) {

		if ( map == null ) return;

		map.getRoads().forEach( road => {

			this.roadService.remove( road );

			this.roadObjectService.removeObjectsByRoad( road );

		} );

		map.destroy();

	}

	async showOpenWindow ( path?: string ) {

		const response = await this.dialogService.openDialog( {
			path: path,
			extensions: [ 'scene' ],
		} );

		if ( response.canceled ) return;

		if ( response.filePaths == null || response.filePaths.length == 0 ) return;

		await this.openFromPath( response.filePaths[ 0 ] );

	}

	async openFromPath ( path: string, callback?: Function ) {

		TvConsole.info( 'Opening file: ' + path );

		const contents = await this.storageService.readAsync( path );

		const map = this.sceneImporter.import( contents );

		this.setMap( map );

		this.currentFile.path = path;

		this.currentFile.name = FileUtils.getFilenameFromPath( path );

		this.electronService.setTitle( this.currentFile.name, this.currentFile.path );

		callback?.();

	}

	async save () {

		if ( this.currentFile == null ) {
			TvConsole.error( 'Create file before saving' );
			return;
		}

		const isFileOpen = this.currentFile.path != null;

		if ( isFileOpen ) {

			this.updateSceneAsset( this.currentFile.path );

		} else {

			await this.saveAs();

		}

	}

	async saveAs () {

		const options = {
			defaultPath: this.projectService.projectPath,
		}

		const res = await this.dialogService.saveDialog( options );

		if ( res.canceled ) return;

		if ( res.filePath == null ) return;

		this.createSceneAsset( res.filePath );

	}

	private createSceneAsset ( path: string ) {

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

		this.snackBar.success( 'Scene Saved!' );

	}

	private updateSceneAsset ( path: string ) {

		const extension = 'scene';

		// append the extension if not present in the path
		if ( !path.includes( `.${ extension }` ) ) {
			path = path + '.' + extension;
		}

		this.assetService.updateSceneAsset( path, this.mapService.map );

		this.snackBar.success( 'Scene Saved!' );

	}

}

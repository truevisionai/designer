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
import { FileService } from '../io/file.service';
import { ScenarioService } from '../modules/scenario/services/scenario.service';
import { CommandHistory } from './command-history';
import { SceneExporterService } from '../exporters/scene-exporter.service';
import { SceneImporterService } from '../importers/scene-importer.service';
import { SnackBar } from './snack-bar.service';
import { TvElectronService } from './tv-electron.service';
import { DialogService } from './dialog/dialog.service';
import { MapService } from "./map.service";

@Injectable( {
	providedIn: 'root'
} )
export class TvSceneFileService {

	constructor (
		public sceneExporter: SceneExporterService,
		public sceneImporter: SceneImporterService,
		public fileService: FileService,
		public threeService: ThreeService,
		public electronService: TvElectronService,
		private dialogService: DialogService,
		private scenarioService: ScenarioService,
		public mapService: MapService,
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

		TvConsole.info( 'Opening file: ' + response.filePaths[ 0 ] );

		this.sceneImporter.importFromPath( response.filePaths[ 0 ] );

	}

	openFromPath ( path: string, callback?: Function ) {

		this.sceneImporter.importFromPath( path );

		callback?.();

	}

	save () {

		if ( this.currentFile == null ) throw new Error( 'Create file before saving' );

		const contents = this.currentFile.contents = this.sceneExporter.export( this.mapService.map );

		ToolManager.disable();	// disable tools while saving

		// path exists means it was imported locally
		if ( this.currentFile.path != null ) {

			this.fileService.writeFile( this.currentFile.path, contents, ( file: IFile ) => {

				this.currentFile.path = file.path;
				this.currentFile.name = file.name;

				this.electronService.setTitle( this.currentFile.name, this.currentFile.path );

				SnackBar.success( 'File Saved!' );

				ToolManager.enable();	// enable tools after saving

			} );

		} else {

			this.saveAs();

		}

	}

	saveAs () {

		const contents = this.sceneExporter.export();

		const folder = this.fileService.projectFolder;

		this.fileService.saveFileWithExtension( folder, contents, this.sceneExporter.extension, ( file: IFile ) => {

			this.currentFile.path = file.path;
			this.currentFile.name = file.name;

			this.electronService.setTitle( file.name, file.path );

			SnackBar.success( 'File Saved!' );

			ToolManager.enable();	// enable tools after saving

		} );

	}

}

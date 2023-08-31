/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AppInspector } from 'app/core/inspector';
import { IFile } from 'app/core/io/file';
import { AppService } from 'app/core/services/app.service';
import { ToolManager } from 'app/core/tools/tool-manager';
import { TvConsole } from 'app/core/utils/console';
import { ThreeService } from 'app/modules/three-js/three.service';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { ScenarioInstance } from '../modules/scenario/services/scenario-instance';
import { CommandHistory } from './command-history';
import { FileService } from '../core/io/file.service';
import { SceneExporterService } from './scene-exporter.service';
import { SceneImporterService } from './scene-importer.service';
import { SnackBar } from './snack-bar.service';
import { TvElectronService } from './tv-electron.service';
import { SceneService } from 'app/core/services/scene.service';

@Injectable( {
	providedIn: 'root'
} )
export class MainFileService {

	constructor (
		public sceneExporter: SceneExporterService,
		public sceneImporter: SceneImporterService,
		public fileService: FileService,
		public threeService: ThreeService,
		public electronService: TvElectronService,
	) {
	}

	get currentFile () {
		return TvMapInstance.currentFile;
	}

	set currentFile ( value ) {
		TvMapInstance.currentFile = value;
	}

	get map () {
		return TvMapInstance.map;
	}

	set map ( value ) {
		TvMapInstance.map = value;
	}

	get scenario () {
		return ScenarioInstance.scenario;
	}

	set scenario ( value ) {
		ScenarioInstance.scenario = value;
	}

	importViaContent ( content: string ) {

		this.sceneImporter.importFromString( content );

	}

	newScene ( map?: TvMap ) {

		this.currentFile = new IFile( 'Untitled.scene' );

		this.electronService.setTitle( this.currentFile.name );

		this.setMap( map || new TvMap() );

	}

	setMap ( map: TvMap ) {

		this.threeService.reset();

		ToolManager.clear();

		AppInspector.clear();

		CommandHistory.clear();

		this.map?.destroy();

		this.scenario?.destroy();

		this.map = map;

		TvMapBuilder.buildMap( this.map );
	}

	showOpenWindow ( path?: string ) {

		this.fileService.showOpenWindow( path, 'tv-map', [ 'xml', 'xosc' ], ( file: IFile ) => {

			TvConsole.info( 'Opening file: ' + file.path );

			this.sceneImporter.importFromFile( file );

		} );

	}

	openFromPath ( path: string, callback?: Function ) {

		if ( AppService.isElectronApp ) {

			this.fileService.readFile( path, 'xml', ( file: IFile ) => {

				this.sceneImporter.importFromString( file.contents );

				if ( callback ) callback();

			} );

		}

	}

	save () {

		if ( this.currentFile == null ) throw new Error( 'Create file before saving' );

		this.currentFile.contents = this.sceneExporter.export( this.map );

		this.saveLocally( this.currentFile );

	}

	saveAs () {

		ToolManager.disable();

		AppInspector.clear();

		CommandHistory.clear();

		this.sceneExporter.saveAs();

	}

	saveLocally ( file: IFile ) {

		// path exists means it was imported locally
		if ( this.currentFile.path != null ) {

			this.fileService.saveFile( file.path, file.contents, ( file: IFile ) => {

				this.currentFile.path = file.path;
				this.currentFile.name = file.name;

				this.electronService.setTitle( this.currentFile.name, this.currentFile.path );

				SnackBar.success( 'File Saved!' );

				ToolManager.enable();


			} );

		} else {

			this.saveAs();

		}
	}

}

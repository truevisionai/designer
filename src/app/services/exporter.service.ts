/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { SetToolCommand } from 'app/commands/set-tool-command';
import { IFile } from 'app/io/file';
import { ToolManager } from 'app/tools/tool-manager';
import { TvConsole } from 'app/core/utils/console';
import { ThreeJsUtils } from 'app/core/utils/threejs-utils';
import { OpenScenarioExporter } from 'app/modules/scenario/services/open-scenario-exporter';
import { ScenarioInstance } from 'app/modules/scenario/services/scenario-instance';
import { OpenDriveExporter } from 'app/modules/tv-map/services/open-drive-exporter';

import { TvCarlaExporter } from 'app/modules/tv-map/services/tv-carla-exporter';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { TvMapService } from 'app/modules/tv-map/services/tv-map.service';
import { saveAs } from 'file-saver';

import { cloneDeep } from 'lodash';

import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { FileService } from '../io/file.service';

import { CommandHistory } from './command-history';
import { SceneExporterService } from './scene-exporter.service';
import { SnackBar } from './snack-bar.service';
import { TvElectronService } from './tv-electron.service';

export enum CoordinateSystem {
	THREE_JS,
	OPEN_DRIVE,
	BLENDER,
	UNITY_GLTF
}

@Injectable( {
	providedIn: 'root'
} )
export class ExporterService {

	constructor (
		private odService: TvMapService,
		private fileService: FileService,
		private electron: TvElectronService,
		private sceneExporter: SceneExporterService,
		private scenarioWriter: OpenScenarioExporter
	) {
	}


	exportScene () {

		this.clearTool();

		this.sceneExporter.saveAs();

	}

	exportOpenDrive ( filename = 'map.xodr' ) {

		ToolManager.disable();

		const mapExporter = new OpenDriveExporter();

		const contents = mapExporter.getOutput( TvMapInstance.map );

		const directory = this.fileService.projectFolder;

		this.fileService.saveFileWithExtension( directory, contents, 'xodr', ( file: IFile ) => {

			SnackBar.success( `File saved ${ file.path }` );

			ToolManager.enable();

		} );

	}

	exportOpenScenario ( filename = 'scenario.xosc' ) {

		ToolManager.disable();

		const scenarioExporter = new OpenScenarioExporter();

		const contents = scenarioExporter.getOutputString( ScenarioInstance.scenario );

		const directory = this.fileService.projectFolder;

		this.fileService.saveFileWithExtension( directory, contents, 'xosc', ( file: IFile ) => {

			SnackBar.success( `File saved ${ file.path }` );

			ToolManager.enable();

		} );

	}

	exportGLB ( filename = 'road.glb', coordinateSystem = CoordinateSystem.UNITY_GLTF ) {

		this.clearTool();

		const exporter = new GLTFExporter();

		const gameObjectToExport = cloneDeep( TvMapInstance.map.gameObject );

		// Change the coordinate system of the cloned gameObject
		ThreeJsUtils.changeCoordinateSystem( gameObjectToExport, CoordinateSystem.OPEN_DRIVE, coordinateSystem );

		exporter.parse( gameObjectToExport, ( buffer: any ) => {

			const blob = new Blob( [ buffer ], { type: 'application/octet-stream' } );

			saveAs( blob, filename );

		}, ( error ) => {

			TvConsole.error( 'Error in exporting GLB ' + error.error );

		}, { binary: true, forceIndices: true } );

	}

	exportGTLF () {

		this.clearTool();

		const options = {};

		const exporter = new GLTFExporter();

		exporter.parse( TvMapInstance.map.gameObject, ( result ) => {

			const text = JSON.stringify( result, null, 2 );

			const filename = 'road.gltf';

			saveAs( new Blob( [ text ], { type: 'text/plain' } ), filename );

		}, ( error ) => {

			TvConsole.error( 'Error in exporting GLB ' + error.error );

		}, options );

	}

	exportCARLA () {

		this.clearTool();

		const exporter = new TvCarlaExporter();

		const contents = exporter.getOutput( this.odService.map );

		this.fileService.saveFileWithExtension( null, contents, 'xodr', ( file: IFile ) => {

			SnackBar.success( `File saved ${ file.path }` );

		} );

	}

	private clearTool () {

		CommandHistory.execute( new SetToolCommand( null ) );

	}
}

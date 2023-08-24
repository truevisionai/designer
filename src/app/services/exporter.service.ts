/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { SetToolCommand } from 'app/core/commands/set-tool-command';
import { GameObject } from 'app/core/game-object';
import { IFile } from 'app/core/models/file';

import { TvCarlaExporter } from 'app/modules/tv-map/services/tv-carla-exporter';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { TvMapService } from 'app/modules/tv-map/services/tv-map.service';
import { saveAs } from 'file-saver';
import { Object3D } from 'three';

import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

import { CommandHistory } from './command-history';
import { FileService } from './file.service';
import { SceneExporterService } from './scene-exporter.service';
import { SnackBar } from './snack-bar.service';
import { TvElectronService } from './tv-electron.service';

import { cloneDeep } from 'lodash';
import { ThreeJsUtils } from 'app/core/utils/threejs-utils';
import { TvConsole } from 'app/core/utils/console';
import { ToolManager } from 'app/core/tools/tool-manager';
import { OpenScenarioExporter } from 'app/modules/scenario/services/open-scenario-exporter';
import { TvScenario } from 'app/modules/scenario/models/tv-scenario';
import { ScenarioInstance } from 'app/modules/scenario/services/scenario-instance';

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

	exportOpenDrive () {

		this.clearTool();

		this.odService.saveAs();
	}

	exportOpenScenario ( filename = 'scenario.xosc' ) {

		ToolManager.disable();

		const scenarioExporter = new OpenScenarioExporter();

		const contents = scenarioExporter.getOutputString( ScenarioInstance.scenario );

		const directory = this.fileService.projectFolder;

		this.fileService.saveFileWithExtension( directory, contents, 'xosc', ( file: IFile ) => {

			SnackBar.success( `File saved ${ file.path }` );

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

			this.odService.currentFile.path = file.path;
			this.odService.currentFile.name = file.name;

			SnackBar.success( `File saved ${ file.path }` );

		} );

	}

	private clearTool () {

		CommandHistory.execute( new SetToolCommand( null ) );

	}
}

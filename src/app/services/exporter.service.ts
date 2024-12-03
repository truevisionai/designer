/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { IFile } from 'app/io/file';
import { ToolManager } from 'app/managers/tool-manager';
import { TvConsole } from 'app/core/utils/console';
import { ThreeJsUtils } from 'app/core/utils/threejs-utils';
import { OpenScenarioExporter } from 'app/scenario/services/open-scenario-exporter';
import { ScenarioService } from 'app/scenario/services/scenario.service';
import { TvCarlaExporter } from 'app/map/services/tv-carla-exporter';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { FileService } from '../io/file.service';
import { SnackBar } from './snack-bar.service';
import { CoordinateSystem } from './CoordinateSystem';
import { MapService } from './map/map.service';
import { SceneService } from "./scene.service";
import { Object3D } from "three";
import { FileExtension } from "../io/file-extension";
import { StorageService } from "../io/storage.service";
import { FileUtils } from "../io/file-utils";
import { ExporterFactory } from 'app/factories/exporter.factory';
import { Commands } from 'app/commands/commands';

import { saveAs } from 'file-saver';
import { cloneDeep } from 'lodash';

@Injectable( {
	providedIn: 'root'
} )
export class ExporterService {

	constructor (
		private fileService: FileService,
		private mapService: MapService,
		private snackBar: SnackBar,
		private storage: StorageService,
		private scenarioService: ScenarioService,
		private exporterFactory: ExporterFactory,
		private carlaExporter: TvCarlaExporter,
	) {
	}

	exportOpenDrive (): void {

		ToolManager.disable();

		const mapExporter = this.exporterFactory.getMapExporter( 1, 1 );

		const contents = mapExporter.exportAsString( this.mapService.map );

		const filename = FileUtils.getFilenameWithoutExtension( this.mapService.map.header.name );

		const path = this.storage.join( this.fileService.projectFolder, filename || "map" );

		this.fileService.saveFileWithExtension( path, contents, FileExtension.OPENDRIVE, ( file: IFile ) => {

			this.snackBar.success( `File saved ${ file.path }` );

			ToolManager.enable();

		} );

	}

	exportOpenScenario ( filename = 'scenario.xosc' ): void {

		ToolManager.disable();

		const scenarioExporter = new OpenScenarioExporter();

		const contents = scenarioExporter.getOutputString( this.scenarioService.getScenario() );

		const directory = this.fileService.projectFolder;

		this.fileService.saveFileWithExtension( directory, contents, 'xosc', ( file: IFile ) => {

			this.snackBar.success( `File saved ${ file.path }` );

			ToolManager.enable();

		} );

	}

	exportGLB ( filename = 'road.glb', coordinateSystem = CoordinateSystem.UNITY_GLTF, includeProps = false ): void {

		this.clearTool();

		const exporter = new GLTFExporter();

		let gameObjectToExport: Object3D;

		if ( includeProps ) {

			gameObjectToExport = cloneDeep( SceneService.getMainLayer() );

		} else {

			gameObjectToExport = cloneDeep( this.mapService.map.gameObject );

		}

		// Change the coordinate system of the cloned gameObject
		ThreeJsUtils.changeCoordinateSystem( gameObjectToExport, CoordinateSystem.OPEN_DRIVE, coordinateSystem );

		exporter.parse( gameObjectToExport, ( buffer: any ) => {

			const blob = new Blob( [ buffer ], { type: 'application/octet-stream' } );

			saveAs( blob, filename );

		}, ( error ) => {

			TvConsole.error( 'Error in exporting GLB ' + error.error );

		}, { binary: true, forceIndices: true } );

	}

	exportGTLF (): void {

		this.clearTool();

		const options = {};

		const exporter = new GLTFExporter();

		exporter.parse( this.mapService.map.gameObject, ( result ) => {

			const text = JSON.stringify( result, null, 2 );

			const filename = 'road.gltf';

			saveAs( new Blob( [ text ], { type: 'text/plain' } ), filename );

		}, ( error ) => {

			TvConsole.error( 'Error in exporting GLB ' + error.error );

		}, options );

	}

	exportCARLA (): void {

		this.clearTool();

		const contents = this.carlaExporter.getOutput( this.mapService.map );

		this.fileService.saveFileWithExtension( null, contents, 'xodr', ( file: IFile ) => {

			this.snackBar.success( `File saved ${ file.path }` );

		} );

	}

	private clearTool (): void {

		Commands.SetTool( null );

	}
}

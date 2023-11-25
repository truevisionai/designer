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
import { ScenarioService } from 'app/modules/scenario/services/scenario.service';
import { OpenDriveExporter } from 'app/modules/tv-map/services/open-drive-exporter';
import { TvCarlaExporter } from 'app/modules/tv-map/services/tv-carla-exporter';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { FileService } from '../io/file.service';
import { CommandHistory } from './command-history';
import { SceneExporterService } from '../exporters/scene-exporter.service';
import { SnackBar } from './snack-bar.service';
import { CoordinateSystem } from './CoordinateSystem';
import { MapService } from './map.service';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { MaterialExporter } from 'app/exporters/material-exporter';
import { TvMaterial } from 'app/modules/three-js/objects/tv-material.model';
import { AssetNode, AssetType } from 'app/views/editor/project-browser/file-node.model';
import { TvRoadSign } from 'app/modules/tv-map/models/tv-road-sign.model';
import { VehicleEntity } from 'app/modules/scenario/models/entities/vehicle-entity';
import { AssetDatabase } from 'app/core/asset/asset-database';

import { saveAs } from 'file-saver';
import { cloneDeep } from 'lodash';

@Injectable( {
	providedIn: 'root'
} )
export class ExporterService {

	constructor (
		private fileService: FileService,
		private sceneExporter: SceneExporterService,
		private mapService: MapService,
		private materialExporter: MaterialExporter
	) {
	}

	exportAsset ( assetType: AssetType, assetGuid: string ): string {

		if ( assetType == AssetType.MATERIAL ) {

			return this.getMaterialExport( AssetDatabase.getInstance( assetGuid ) );

		} else if ( assetType == AssetType.SCENE ) {

			return this.getSceneExport( AssetDatabase.getInstance( assetGuid ) );

		} else if ( assetType == AssetType.ENTITY ) {

			return this.getVehicleExport( AssetDatabase.getInstance( assetGuid ) );

		} else {

			TvConsole.error( 'ExporterService: exportAsset: Unknown asset type ' + assetType );

		}

	}

	getRoadSignExport ( sign: TvRoadSign ) {

		return sign.toJSONString();

	}

	getSceneExport ( map: TvMap ): string {

		return this.sceneExporter.export( map );

	}

	getVehicleExport ( vehicle: VehicleEntity ): string {

		return vehicle.toJSONString();

	}

	getMaterialExport ( material: TvMaterial ): string {

		return this.materialExporter.export( material );

	}

	exportScene () {

		this.clearTool();

		this.sceneExporter.saveAs();

	}

	exportOpenDrive ( filename = 'map.xodr' ) {

		ToolManager.disable();

		const mapExporter = new OpenDriveExporter();

		const contents = mapExporter.getOutput( this.mapService.map );

		const directory = this.fileService.projectFolder;

		this.fileService.saveFileWithExtension( directory, contents, 'xodr', ( file: IFile ) => {

			SnackBar.success( `File saved ${ file.path }` );

			ToolManager.enable();

		} );

	}

	exportOpenScenario ( filename = 'scenario.xosc' ) {

		ToolManager.disable();

		const scenarioExporter = new OpenScenarioExporter();

		const contents = scenarioExporter.getOutputString( ScenarioService.scenario );

		const directory = this.fileService.projectFolder;

		this.fileService.saveFileWithExtension( directory, contents, 'xosc', ( file: IFile ) => {

			SnackBar.success( `File saved ${ file.path }` );

			ToolManager.enable();

		} );

	}

	exportGLB ( filename = 'road.glb', coordinateSystem = CoordinateSystem.UNITY_GLTF ) {

		this.clearTool();

		const exporter = new GLTFExporter();

		const gameObjectToExport = cloneDeep( this.mapService.map.gameObject );

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

		exporter.parse( this.mapService.map.gameObject, ( result ) => {

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

		const contents = exporter.getOutput( this.mapService.map );

		this.fileService.saveFileWithExtension( null, contents, 'xodr', ( file: IFile ) => {

			SnackBar.success( `File saved ${ file.path }` );

		} );

	}

	private clearTool () {

		CommandHistory.execute( new SetToolCommand( null ) );

	}
}

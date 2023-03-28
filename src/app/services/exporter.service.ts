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

enum CoordinateSystem {
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
		private sceneExporter: SceneExporterService
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

	exportGLB ( filename = 'road.glb' ) {

		this.clearTool();

		const exporter = new GLTFExporter();

		const gameObjectToExport = cloneDeep( TvMapInstance.map.gameObject );

		// Change the coordinate system of the cloned gameObject
		this.changeCoordinateSystem( gameObjectToExport, CoordinateSystem.OPEN_DRIVE, CoordinateSystem.UNITY_GLTF );

		exporter.parse( gameObjectToExport, ( buffer: any ) => {

			const blob = new Blob( [ buffer ], { type: 'application/octet-stream' } );

			saveAs( blob, filename );

		}, ( error ) => {

		}, { binary: true, forceIndices: true } );

	}



	changeCoordinateSystem ( gameObject: Object3D, from: CoordinateSystem, to: CoordinateSystem ) {

		// FBX: Y-up (depends on the tool that exported it, but most commonly Y-up)
		// Three.js: Y-up
		// OpenDRIVE: Z-up
		// Blender: Z-up
		// glTF: Y-up
		// GLB (Binary glTF): Y-up
		// OBJ: No specific coordinate system is defined, but typically
		// it's Y-up or Z-up. The source tool's coordinate system often
		// determines the exported OBJ file's coordinate system.
		// Unity3D: Y-up
		// Unreal Engine: Z-up

		const fromTo = [ from, to ].join( '_' );

		switch ( fromTo ) {
			case [ CoordinateSystem.THREE_JS, CoordinateSystem.OPEN_DRIVE ].join( '_' ):
				// THREE.js (Y-up) to OpenDRIVE (Z-up)
				gameObject.rotateX( Math.PI / 2 );
				break;
			case [ CoordinateSystem.OPEN_DRIVE, CoordinateSystem.BLENDER ].join( '_' ):
				// OpenDRIVE (Z-up) to Blender (Z-up)
				// No change required
				break;
			case [ CoordinateSystem.OPEN_DRIVE, CoordinateSystem.UNITY_GLTF ].join( '_' ):
				// OpenDRIVE (Z-up) to Unity/glTF (Y-up)
				gameObject.rotateX( -Math.PI / 2 );
				break;
			case [ CoordinateSystem.THREE_JS, CoordinateSystem.BLENDER ].join( '_' ):
				// THREE.js (Y-up) to Blender (Z-up)
				gameObject.rotateX( Math.PI / 2 );
				break;
			case [ CoordinateSystem.THREE_JS, CoordinateSystem.UNITY_GLTF ].join( '_' ):
				// THREE.js (Y-up) to Unity/glTF (Y-up)
				// No change required
				break;
			default:
				console.warn( `Unsupported coordinate system conversion: ${ from } to ${ to }` );
		}

		gameObject.updateMatrix();
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

			console.error( error );

		}, options );

	}

	exportCARLA () {

		this.clearTool();

		const exporter = new TvCarlaExporter();

		const contents = exporter.getOutput( this.odService.map );

		if ( this.electron.isElectronApp ) {

			this.fileService.saveFileWithExtension( null, contents, 'xodr', ( file: IFile ) => {

				this.odService.currentFile.path = file.path;
				this.odService.currentFile.name = file.name;

				SnackBar.success( `File saved ${ file.path }` );

			} );

		} else {

			saveAs( new Blob( [ contents ] ), 'road.xodr' );

		}

	}

	private clearTool () {

		CommandHistory.execute( new SetToolCommand( null ) );

	}
}

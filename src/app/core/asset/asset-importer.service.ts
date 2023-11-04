/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { FileUtils } from 'app/io/file-utils';
import { FileService } from 'app/io/file.service';
import { CoordinateSystem } from 'app/services/exporter.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { TvElectronService } from 'app/services/tv-electron.service';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { ThreeJsUtils } from '../utils/threejs-utils';

@Injectable( {
	providedIn: 'root'
} )
export class AssetImporterService {

	private fs;
	private path;

	// causing bugs need to remove these
	// private successCallback;
	// private errorCallback;

	constructor ( private electronService: TvElectronService, private fileService: FileService ) {
	}

	public import ( filepath: string, successCallback: Function, errorCallback: Function ) {

		this.fs = this.fileService.fs;
		this.path = this.fileService.path;

		const fileExtension = this.path.extname( filepath );

		switch ( fileExtension ) {
			case '.obj':
				this.importOBJ( filepath, successCallback, errorCallback );
				break;

			case '.dae':
				this.importCollada( filepath, successCallback, errorCallback );
				break;

			case '.gltf':
				this.importGLTF( filepath, successCallback, errorCallback );
				break;

			case '.glb':
				this.importGLTF( filepath, successCallback, errorCallback );
				break;

			case '.fbx':
				this.importFBX( filepath, successCallback, errorCallback );
				break;

			default:
				SnackBar.warn( 'unknown 3d format. Please use any of obj, dae, fbx formats' );
				break;
		}

	}

	importOBJ ( filepath: string, success: Function, error: Function ) {

		var loader = new OBJLoader();

		this.fs.readFile( filepath, 'utf-8', ( err, data ) => {

			if ( err ) {
				error( 'An error ocurred reading the file :' + err.message );
				return;
			}

			const group = loader.parse( data );

			ThreeJsUtils.changeCoordinateSystem( group, CoordinateSystem.UNITY_GLTF, CoordinateSystem.OPEN_DRIVE );

			success( group );

		} );

	}

	importGLTF ( filepath: string, success: Function, error: Function ) {

		const loader = new GLTFLoader();

		// const dir = filepath.split( '/' ).slice( 0, -1 ).join( '/' ) + '/';

		loader.load( `file:///${ filepath }`, ( gltf ) => {

			ThreeJsUtils.changeCoordinateSystem( gltf.scene, CoordinateSystem.UNITY_GLTF, CoordinateSystem.OPEN_DRIVE );

			success( gltf.scene );

		}, () => {

			// on progress

		}, ( err ) => {

			console.error( err );

			error( err );

		} );

	}

	importCollada ( filepath: string, success: Function, error: Function ) {

		var loader = new ColladaLoader();

		this.fs.readFile( filepath, 'utf-8', ( err, data ) => {

			if ( err ) {
				error( 'An error ocurred reading the file :' + err.message );
				return;
			}

			const group = loader.parse( data, filepath );

			ThreeJsUtils.changeCoordinateSystem( group.scene, CoordinateSystem.UNITY_GLTF, CoordinateSystem.OPEN_DRIVE );

			success( group.scene );

		} );

	}

	async importFBX ( filepath: string, success: Function, error: Function ) {

		const loader = new FBXLoader();

		const buffer = await this.fileService.readAsArrayBuffer( filepath );

		const directory = FileUtils.getDirectoryFromPath( filepath );

		const object = loader.parse( buffer, directory );

		success( object );

	}

}

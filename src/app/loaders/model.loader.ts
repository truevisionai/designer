/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { SnackBar } from '../services/snack-bar.service';
import { ThreeJsUtils } from 'app/core/utils/threejs-utils';
import { FileUtils } from 'app/io/file-utils';
import { CoordinateSystem } from 'app/services/CoordinateSystem';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { StorageService } from 'app/io/storage.service';
import { Object3D } from 'three';
import { TvConsole } from 'app/core/utils/console';

@Injectable( {
	providedIn: 'root'
} )
export class ModelLoader {

	constructor (
		private storageService: StorageService
	) {
	}

	load ( path: string, successCallback: ( object: Object3D ) => void, errorCallback: ( error: string ) => void ) {

		const fileExtension = FileUtils.getExtensionFromPath( path );

		switch ( fileExtension ) {

			case 'obj':
				this.importOBJ( path, successCallback, errorCallback );
				break;

			case 'dae':
				this.importCollada( path, successCallback, errorCallback );
				break;

			case 'gltf':
				this.importGLTF( path, successCallback, errorCallback );
				break;

			case 'glb':
				this.importGLTF( path, successCallback, errorCallback );
				break;

			case 'fbx':
				this.importFBX( path, successCallback, errorCallback );
				break;

			default:
				TvConsole.error( 'unknown 3d format. Please use any of obj, dae, gltf, glb, fbx formats. path:' + path );
				break;
		}

	}

	private importOBJ ( filepath: string, success: Function, error: Function ) {

		var loader = new OBJLoader();

		const data = this.storageService.readSync( filepath );

		if ( !data ) {

			error( 'file not found' );

			return;
		}

		const group = loader.parse( data );

		ThreeJsUtils.changeCoordinateSystem( group, CoordinateSystem.UNITY_GLTF, CoordinateSystem.OPEN_DRIVE );

		success( group );

	}

	private importGLTF ( filepath: string, success: Function, error: Function ) {

		const loader = new GLTFLoader();

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

	private importCollada ( filepath: string, success: Function, error: Function ) {

		var loader = new ColladaLoader();

		const data = this.storageService.readSync( filepath );

		if ( !data ) {

			error( 'file not found' );

			return;
		}

		const group = loader.parse( data, filepath );

		ThreeJsUtils.changeCoordinateSystem( group.scene, CoordinateSystem.UNITY_GLTF, CoordinateSystem.OPEN_DRIVE );

		success( group.scene );

	}

	private async importFBX ( filepath: string, success: Function, error: Function ) {

		const loader = new FBXLoader();

		// const buffer = await this.fileService.readAsArrayBuffer( filepath );

		const buffer = await this.storageService.readAsync( filepath, {
			encoding: 'arraybuffer'
		} );

		const directory = FileUtils.getDirectoryFromPath( filepath );

		const object = loader.parse( buffer, directory );

		success( object );

	}
}

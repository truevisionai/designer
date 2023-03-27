/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { FileService } from 'app/services/file.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { TvElectronService } from 'app/services/tv-electron.service';
import * as THREE from 'three';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

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
				SnackBar.error( 'unknown 3d format. Please use any of obj, dae, fbx formats' );
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

			success( group );

		} );

	}

	importGLTF ( filepath: string, success: Function, error: Function ) {

		const loader = new GLTFLoader();

		const dir = filepath.split( '/' ).slice( 0, -1 ).join( '/' ) + '/';

		loader.load( `file:///${ filepath }`, ( gltf ) => {

			success( gltf.scene );

		}, () => {

			// on progress

		}, ( err ) => {

			console.error( err );

			error( err );

		} );

		// this.fs.readFile( filepath, 'ascii', ( err, data ) => {

		//     if ( err ) {
		//         error( 'An error ocurred reading the file :' + err.message );
		//         return;
		//     }

		//     const dir = filepath.split( '/' ).slice( 0, -1 ).join( '/' ) + "/";

		//     loader.parse( data, `file:///${ dir }`, ( gltf ) => {

		//         success( gltf.scene );

		//     }, ( err ) => {

		//         error( err )

		//     } );

		// } )

	}

	importCollada ( filepath: string, success: Function, error: Function ) {

		var loader = new ColladaLoader();

		this.fs.readFile( filepath, 'utf-8', ( err, data ) => {

			if ( err ) {
				error( 'An error ocurred reading the file :' + err.message );
				return;
			}

			const group = loader.parse( data, filepath );

			success( group.scene );

		} );

	}

	importFBX ( filepath: string, success: Function, error: Function ) {

		SnackBar.error( 'FBX files are not supported' );

		// var loader = new THREE.FBXLoader();

		// loader.load( 'assets/TrafficCone01.fbx', function ( object ) {
		//     // loader.load( 'assets/Box.fbx', function ( object ) {

		//     object.traverse( ( child: any ) => {

		//         if ( child.isMesh ) {

		//             child.castShadow = true;
		//             child.receiveShadow = true;

		//         }

		//     } );

		//     SceneService.add( object );

		// }, ( e ) => console.debug( e ), ( e ) => console.error( e ) );

		// this.fs.readFile( filepath, 'utf-8', ( err, data ) => {

		//     if ( err ) {
		//         error( 'An error ocurred reading the file :' + err.message );
		//         return;
		//     }

		//     try {

		//         success( loader.parse( data, filepath ) );

		//     } catch ( error ) {

		//         console.error( error );

		//         error( 'Could not import file, ' + error.message );

		//     }


		// } );

	}

}

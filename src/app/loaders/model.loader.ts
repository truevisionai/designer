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
import { DoubleSide, Group, Mesh, MeshStandardMaterial, Object3D, ShapeGeometry } from 'three';
import { TvConsole } from 'app/core/utils/console';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { AssetLoader } from "../core/interfaces/asset.loader";
import { Asset } from "../core/asset/asset.model";

/**
 * @deprecated
 */
@Injectable( {
	providedIn: 'root'
} )
export class DeprecatedModelLoader implements AssetLoader {

	constructor (
		private storageService: StorageService,
		private snackBar: SnackBar
	) {
	}

	load ( asset: Asset ): any {

		const path = asset.path;

		this.loadSync( path, null, null );

	}

	loadSync ( path: string, successCallback: ( object: Object3D ) => void, errorCallback: ( error: string ) => void ) {

		const fileExtension = FileUtils.getExtensionFromPath( path );

		switch ( fileExtension.toLowerCase().trim() ) {

			case 'obj':
				this.loadOBJ( path, successCallback, errorCallback );
				break;

			case 'dae':
				this.loadCollada( path, successCallback, errorCallback );
				break;

			case 'gltf':
				this.loadGLTF( path, successCallback, errorCallback );
				break;

			case 'glb':
				this.loadGLTF( path, successCallback, errorCallback );
				break;

			case 'fbx':
				this.loadFBX( path, successCallback, errorCallback );
				break;

			case 'svg':
				this.loadSVG( path, successCallback, errorCallback );
				break;

			default:
				TvConsole.error( 'unknown 3d format. Please use any of obj, dae, gltf, glb, fbx formats. path:' + path );
				break;
		}

	}

	private loadOBJ ( filepath: string, success: Function, error: Function ) {

		const loader = new OBJLoader();

		const data = this.storageService.readSync( filepath );

		if ( !data ) {

			error( 'file not found' );

			return;
		}

		const group = loader.parse( data );

		ThreeJsUtils.changeCoordinateSystem( group, CoordinateSystem.UNITY_GLTF, CoordinateSystem.OPEN_DRIVE );

		success( group );

		return group;
	}

	private loadGLTF ( filepath: string, success: Function, error: Function ) {

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

	private loadCollada ( filepath: string, success: Function, error: Function ) {

		var loader = new ColladaLoader();

		const data = this.storageService.readSync( filepath );

		if ( !data ) {

			error( 'file not found' );

			return;
		}

		const group = loader.parse( data, filepath );

		ThreeJsUtils.changeCoordinateSystem( group.scene, CoordinateSystem.UNITY_GLTF, CoordinateSystem.OPEN_DRIVE );

		success( group.scene );

		return group.scene;
	}

	private async loadFBX ( filepath: string, success: Function, error: Function ) {

		const loader = new FBXLoader();

		const buffer = await this.storageService.readAsync( filepath, {
			encoding: 'arraybuffer'
		} );

		const directory = FileUtils.getDirectoryFromPath( filepath );

		const object = loader.parse( buffer, directory );

		success( object );

		return object;
	}

	private loadSVG ( path: string, successCallback: ( object: Object3D ) => void, errorCallback: ( error: string ) => void ) {

		const loader = new SVGLoader();

		loader.load( path, function ( data ) {

			const paths = data.paths;
			const group = new Group();

			for ( let i = 0; i < paths.length; i++ ) {

				const path = paths[ i ];

				const material = new MeshStandardMaterial( {
					color: path.color,
					side: DoubleSide,
					depthWrite: false
				} );

				const shapes = SVGLoader.createShapes( path );

				for ( let j = 0; j < shapes.length; j++ ) {

					const shape = shapes[ j ];

					const geometry = new ShapeGeometry( shape );

					const mesh = new Mesh( geometry, material );

					group.add( mesh );

				}

			}

			successCallback( group );

		}, function ( xhr ) {

			// errorCallback

		}, ( error ) => {

			errorCallback( "Error in loading SVG file" );

			this.snackBar.error( 'Error in loading SVG file' );

		} );

	}

}

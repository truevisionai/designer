/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetImporterService } from 'app/core/asset/asset-importer.service';
import { Metadata } from 'app/core/models/metadata.model';
import { SceneService } from 'app/core/services/scene.service';
import { Object3D, Vector3 } from 'three';
import { FileService } from '../core/io/file.service';
import { SnackBar } from './snack-bar.service';

@Injectable( {
	providedIn: 'root'
} )
export class ModelImporterService {

	constructor ( private assetImporter: AssetImporterService ) {
	}

	public import ( path: string, filename?: string, extension?: string, position?: Vector3, metadata?: Metadata ) {

		// const metadata = this.assetService.fetchMetaFile( path );

		this.load( path, ( object ) => {

			if ( position ) object.position.set( position.x, position.y, position.z );

			SceneService.add( object );

		}, metadata, extension );

	}

	public load ( path: string, callback: ( object: Object3D ) => void, metadata: Metadata, extension?: string ): void {

		// if ( !metadata ) metadata = this.assetService.fetchMetaFile( path );

		if ( !extension ) extension = FileService.getExtension( path );

		switch ( extension ) {

			case 'gltf':
				this.load3DFile( path, callback );
				break;

			case 'glb':
				this.load3DFile( path, callback );
				break;

			case 'obj':
				this.load3DFile( path, callback );
				break;

			case 'fbx':
				this.load3DFile( path, callback );
				break;

			default:
				console.error( 'unknown file type', extension, path );
				SnackBar.warn( 'Not able to import' );
				break;
		}

	}

	private load3DFile ( path: string, callback: ( object: Object3D ) => void ): void {

		this.assetImporter.import( path, ( object ) => {

			callback( object );

		}, ( e ) => {

			SnackBar.error( e );

		} );

	}
}

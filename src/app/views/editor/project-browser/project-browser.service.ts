/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { AssetNode, AssetType } from './file-node.model';
import { StorageService } from "../../../io/storage.service";
import { Metadata } from "../../../core/asset/metadata.model";

@Injectable( {
	providedIn: 'root'
} )
export class ProjectBrowserService {

	public folderChanged = new EventEmitter<AssetNode>();

	constructor (
		private storage: StorageService
	) {
	}

	getFolders ( path: string ) {

		return this.storage.getDirectoryFiles( path ).filter( node => node.type == 'directory' ).map( node => {

			return new AssetNode( AssetType.DIRECTORY, node.name, node.path );

		} );

	}

	getFiles ( path: string ) {

		return this.storage.getDirectoryFiles( path )
			.filter( node => !node.name.includes( ".meta" ) )
			.filter( node => this.hasMetadata( node ) )
			.map( node => {

				const metadata = this.getMetadata( node );

				if ( node.type == 'directory' ) {

					return new AssetNode( AssetType.DIRECTORY, node.name, node.path, metadata );

				}

				return new AssetNode( AssetType.FILE, node.name, node.path, metadata );

			} );

	}

	getMetadata ( file: AssetNode | string ): Metadata {

		try {

			let path = null;

			if ( typeof ( file ) === 'string' ) path = file;

			if ( typeof ( file ) === 'object' ) path = file.path;

			if ( !path.includes( '.meta' ) ) path = path + '.meta';

			const contents = this.storage.readSync( path );

			return JSON.parse( contents );

		} catch ( error ) {

			// console.error( error, file );

			// SnackBar.error( "Error in reading .meta file. Please Reimport the asset.", "", 5000 );
		}

	}

	hasMetadata ( file: AssetNode | string ): boolean {

		try {

			let path = null;

			if ( typeof ( file ) === 'string' ) path = file;

			if ( typeof ( file ) === 'object' ) path = file.path;

			if ( !path.includes( '.meta' ) ) path = path + '.meta';

			return this.storage.exists( path );

		} catch ( error ) {

			return false;

		}
	}
}

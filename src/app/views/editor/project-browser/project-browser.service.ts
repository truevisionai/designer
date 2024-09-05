/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { Asset, AssetType } from '../../../assets/asset.model';
import { StorageService } from "../../../io/storage.service";
import { Metadata } from "../../../assets/metadata.model";

@Injectable( {
	providedIn: 'root'
} )
export class ProjectBrowserService {

	public folderChanged = new EventEmitter<Asset>();

	constructor (
		private storage: StorageService
	) {
	}

	getFolders ( path: string ) {

		return this.storage.getDirectoryFiles( path ).filter( node => node.type == 'directory' ).map( node => {

			return new Asset( AssetType.DIRECTORY, node.name, node.path );

		} );

	}

	getAssets ( path: string ) {

		const assets: Asset[] = [];

		for ( const node of this.storage.getDirectoryFiles( path ) ) {

			if ( node.name.includes( ".meta" ) ) continue;

			if ( !this.hasMetadata( node ) ) continue;

			const metadata = this.getMetadata( node );

			if ( node.type == 'directory' ) {

				assets.push( new Asset( AssetType.DIRECTORY, node.name, node.path, metadata ) );

			} else {

				const type = Asset.getType( metadata.importer );

				assets.push( new Asset( type, node.name, node.path, metadata ) );

			}

		}

		return assets;

	}

	getMetadata ( file: Asset | string ): Metadata {

		try {

			let path = null;

			if ( typeof ( file ) === 'string' ) path = file;

			if ( typeof ( file ) === 'object' ) path = file.path;

			if ( !path.includes( '.meta' ) ) path = path + '.meta';

			const contents = this.storage.readSync( path );

			return JSON.parse( contents );

		} catch ( error ) {

			// console.error( error, file );

			// SnackBar.error( "Error in reading .meta file. Please Reimport the assets.", "", 5000 );
		}

	}

	hasMetadata ( file: Asset | string ): boolean {

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

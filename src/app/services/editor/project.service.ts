/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvElectronService } from '../tv-electron.service';
import { Asset } from 'app/core/asset/asset.model';
import { Metadata } from 'app/core/asset/metadata.model';
import { StorageService } from 'app/io/storage.service';
import { AssetService } from 'app/core/asset/asset.service';
import { MetadataFactory } from 'app/factories/metadata-factory.service';
import { Debug } from 'app/core/utils/debug';

declare const electronFs;

@Injectable( {
	providedIn: 'root'
} )
export class ProjectService {

	get remote () {

		return this.electronService.remote;

	}

	get userDocumentFolder () {

		return this.remote.app.getPath( 'documents' );

	}

	get currentDirectory () {

		return electronFs.currentDirectory;

	}

	get projectPath () {

		if ( this.electronService.isWindows ) {

			return this.userDocumentFolder + '\\Truevision';

		} else if ( this.electronService.isLinux ) {

			return this.userDocumentFolder + '/Truevision';

		} else if ( this.electronService.isMacOS ) {

			return this.userDocumentFolder + '/Truevision';

		} else {

			throw new Error( 'Unsupported platform. Please contact support for more details.' );

		}

	}

	get isProjectFolder () {

		return this.storageService.exists( this.projectPath );

	}

	get settingsPath () {

		return this.storageService.join( this.projectPath, 'settings.json' );

	}

	constructor (
		private electronService: TvElectronService,
		private storageService: StorageService,
		private assetService: AssetService,
	) { }

	createSettings (): any {

		if ( !this.storageService.exists( this.settingsPath ) ) {

			this.storageService.writeSync( this.settingsPath, JSON.stringify( {} ) );

		}

	}

	setupDefaultAssets () {

		try {

			// create Truevision Folder in user documents if it does not exist
			if ( !this.isProjectFolder ) {

				this.storageService.createDirectory( this.userDocumentFolder, 'Truevision' );

				this.assetService.createFolderAsset( this.projectPath, 'Materials' );
				this.assetService.createFolderAsset( this.projectPath, 'Props' );
				this.assetService.createFolderAsset( this.projectPath, 'Roads' );
				this.assetService.createFolderAsset( this.projectPath, 'RoadStyles' );
				this.assetService.createFolderAsset( this.projectPath, 'RoadMarkings' );
				this.assetService.createFolderAsset( this.projectPath, 'Signs' );
				this.assetService.createFolderAsset( this.projectPath, 'Scenes' );
				this.assetService.createFolderAsset( this.projectPath, 'Textures' );

				this.createDefaultAssets();


			}

		} catch ( error ) {

			Debug.log( error );

			throw new Error( 'Error in setting up default project folder' );

		}

		this.createSettings();

	}

	createDefaultAssets () {

		this.createBaseAssets( 'RoadStyles' );

		this.createBaseAssets( 'Props' );

		this.createBaseAssets( 'RoadMarkings' );

		this.createBaseAssets( 'Materials' );

	}

	createBaseAssets ( subFolder: string ) {

		try {

			const defaultProjectPath = this.getDefaultProjectPath( subFolder );

			this.storageService.getDirectoryFiles( defaultProjectPath ).forEach( file => {

				const destinationFolder = this.storageService.join( this.projectPath, `/${ subFolder }/` );

				const destinationPath = this.storageService.join( destinationFolder, file.name );

				Debug.log( file, destinationPath );

				if ( file.name.includes( '.meta' ) ) {

					const metadata = this.fetchMetaFile( file );

					metadata.path = destinationPath.replace( '.meta', '' );

					MetadataFactory.saveMetadataFile( destinationPath, metadata );

				} else {

					this.storageService.copyFileSync( file.path, destinationPath );

				}

			} );

		} catch ( error ) {

			console.error( error );

			throw new Error( 'Error in creating assets' );

		}

	}

	getDefaultProjectPath ( folder: string ) {

		if ( this.electronService.remote.app.isPackaged ) {

			const appPath = this.electronService.remote.app.getAppPath();

			return this.storageService.resolve( appPath, `./default-project/${ folder }` );

		} else {

			return this.storageService.join( this.currentDirectory, `/default-project/${ folder }` );

		}
	}

	fetchMetaFile ( file: Asset | string ): Metadata {

		try {

			let path = null;

			if ( typeof ( file ) === 'string' ) path = file;

			if ( typeof ( file ) === 'object' ) path = file.path;

			if ( !path.includes( '.meta' ) ) path = path + '.meta';

			const contents = this.storageService.readSync( path );

			return JSON.parse( contents );

		} catch ( error ) {

			console.error( error, file );

		}

	}

}

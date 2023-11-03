/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { AssetLoaderService } from 'app/core/asset/asset-loader.service';
import { InspectorFactoryService } from 'app/factories/inspector-factory.service';
import { AppInspector } from 'app/core/inspector';
import { Metadata, MetaImporter } from 'app/core/asset/metadata.model';
import { FileNode } from './file-node.model';
import { FileService } from 'app/io/file.service';
import { MetadataFactory } from 'app/factories/metadata-factory.service';
import { AssetFactory } from 'app/core/asset/asset-factory.service';

@Injectable( {
	providedIn: 'root'
} )
export class ProjectBrowserService {

	public static lastFile: FileNode;
	public static lastAsset: Metadata;
	public static lastMetadata: Metadata;

	/**
	 * @deprecated not in use
	 */
	public fileClicked = new EventEmitter<FileNode>();
	public fileDoubleClicked = new EventEmitter<FileNode>();

	public folderChanged = new EventEmitter<FileNode>();

	private get projectDir () {
		return this.fileService.projectFolder;
	}

	constructor ( private assets: AssetLoaderService, private fileService: FileService ) {

		// this.fileClicked.subscribe( file => this.onFileClicked( file ) )

	}

	/**
	 *
	 * @param file
	 * @deprecated not in used
	 */
	onFileClicked ( file: FileNode ) {

		try {

			const meta = this.assets.fetchMetaFile( file );

			// console.log( meta.importer );

			const data = this.assets.find( meta.guid );

			// let instance = null;

			// if ( this.assets.assetInstances.has( meta.guid ) ) {
			//     instance = this.assets.assetInstances.get( meta.guid );
			// } else{
			//     instance = this.assets.assetInstances.set(meta.guid, )
			// }

			ProjectBrowserService.lastFile = file;
			ProjectBrowserService.lastAsset = data;
			ProjectBrowserService.lastMetadata = meta;

			switch ( meta.importer ) {
				case MetaImporter.SIGN:
					AppInspector.setInspector(
						InspectorFactoryService.getInpectorByFilename( file.name ),
						data
					);
					break;

				default:
					AppInspector.setInspector(
						InspectorFactoryService.getInpectorByFilename( file.name ),
						data
					);
					break;
			}

		} catch ( error ) {

			console.error( error, file );

		}
	}

	showFileByGuid ( guid: string ) {

		// const metdata = this.assets.find( guid );

		// const directory = metdata.path.split( '/' ).slice( 0, -1 ).join( '/' );

		// // this.fileSelected.emit( new FileNode( "", 0, false, false, metdata.path, "file", true, false ) );

		// this.folderChanged.emit( new FileNode( "", 0, false, false, directory, "directory", false, false ) );

		// // console.log( metdata.path, directory );
	}

	createProjectFolder () {

		try {

			// create Truevision Folder in user documents if it does not exist
			if ( !this.fileService.fs.existsSync( this.projectDir ) ) {

				this.fileService.createFolder( this.fileService.userDocumentFolder, 'Truevision' );

				AssetFactory.createNewFolder( this.projectDir, 'Materials' );
				AssetFactory.createNewFolder( this.projectDir, 'Props' );
				AssetFactory.createNewFolder( this.projectDir, 'Roads' );
				AssetFactory.createNewFolder( this.projectDir, 'RoadStyles' );
				AssetFactory.createNewFolder( this.projectDir, 'RoadMarkings' );
				AssetFactory.createNewFolder( this.projectDir, 'Signs' );
				AssetFactory.createNewFolder( this.projectDir, 'Scenes' );
				AssetFactory.createNewFolder( this.projectDir, 'Textures' );

				this.createDefaultAssets();


			}

		} catch ( error ) {

			console.log( error );

			throw new Error( 'Error in setting up default project folder' );

		}

	}

	createDefaultAssets () {

		this.createRoadStyleAssets();

		this.createPropAssets();

		this.createRoadMarkingAssets();

		this.createBaseAssets( 'Materials' );

	}

	createRoadMarkingAssets () {

		this.createBaseAssets( 'RoadMarkings' );

	}

	createPropAssets () {

		this.createBaseAssets( 'Props' );

	}

	createRoadStyleAssets () {

		this.createBaseAssets( 'RoadStyles' );

	}

	createBaseAssets ( folder: string ) {

		try {

			let path = null;

			if ( this.fileService.remote.app.isPackaged ) {

				const appPath = this.fileService.remote.app.getAppPath();

				path = this.fileService.resolve( appPath, `./default-project/${ folder }` );

			} else {

				path = this.fileService.join( this.fileService.currentDirectory, `/default-project/${ folder }` );

			}

			this.fileService.readPathContentsSync( path ).forEach( file => {

				const destinationFolder = this.fileService.join( this.projectDir, `/${ folder }/` );

				const destinationPath = this.fileService.join( destinationFolder, file.name );

				if ( file.name.includes( '.meta' ) ) {

					const metadata = this.fetchMetaFile( file );

					metadata.path = destinationPath.replace( '.meta', '' );

					MetadataFactory.saveMetadataFile( destinationPath, metadata );

				} else {

					this.fileService.fs.copyFileSync( file.path, destinationPath );

				}

			} );

		} catch ( error ) {

			console.error( error );

			throw new Error( 'Error in creating assets' );

		}

	}

	fetchMetaFile ( file: FileNode | string ): Metadata {

		try {

			let path = null;

			if ( typeof ( file ) === 'string' ) path = file;

			if ( typeof ( file ) === 'object' ) path = file.path;

			if ( !path.includes( '.meta' ) ) path = path + '.meta';

			return JSON.parse( this.fileService.fs.readFileSync( path, 'utf-8' ) );

		} catch ( error ) {

			console.error( error, file );

			// SnackBar.error( "Error in reading .meta file. Please Reimport the asset.", "", 5000 );
		}

	}
}

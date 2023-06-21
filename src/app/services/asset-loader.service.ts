/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetFactory } from 'app/core/factories/asset-factory.service';
import { MetadataFactory } from 'app/core/factories/metadata-factory.service';
import { TvMaterial } from 'app/modules/three-js/objects/tv-material.model';
import { TvRoadMarking } from 'app/modules/tv-map/services/tv-marking.service';
import { FileNode } from 'app/views/editor/project-browser/file-node.model';
import {
	LinearEncoding,
	LinearFilter,
	LinearMipMapLinearFilter,
	MeshStandardMaterial,
	Object3D,
	RGBAFormat,
	TextureLoader,
	UnsignedByteType
} from 'three';
import { Metadata, MetaImporter } from '../core/models/metadata.model';
import { AssetDatabase } from './asset-database';
import { FileService } from './file.service';
import { ModelImporterService } from './model-importer.service';
import { RoadStyleImporter } from './road-style-importer';

@Injectable( {
	providedIn: 'root'
} )
export class AssetLoaderService {

	// public previewCache: Map<string, string> = new Map<string, string>();

	// public assetInstances: Map<string, any> = new Map<string, any>();

	/**
	 * This class is responsible to loading, caching, importing, reading .meta files.
	 *
	 * @param fileService FileService
	 */
	constructor ( private fileService: FileService, public modelImporterService: ModelImporterService ) {
	}

	private get projectDir () {
		return this.fileService.projectFolder;
	}

	init () {

		this.createProjectFolder();

		this.loadDefaultAssets();

		this.loadDirectory( this.fileService.readPathContentsSync( this.projectDir ) );

		this.loadTextures();

		this.loadMaterials();

		this.loadModels();

		this.loadRoadStyles();

		this.loadRoadMarkings();

		this.loadOpenDriveFiles();

		this.loadOpenScenarioFiles();
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

	loadTextures () {

		AssetDatabase.getMetadataAll().forEach( meta => {

			if ( meta.importer === MetaImporter.TEXTURE ) {

				const data = meta.data;

				const texture = new TextureLoader().load( meta.path );

				texture.uuid = data.uuid;
				texture.name = data.name;
				texture.mapping = data.mapping || 300;

				if ( data.repeat ) texture.repeat.set( data.repeat[ 0 ], data.repeat[ 1 ] );
				if ( data.offset ) texture.offset.set( data.offset[ 0 ], data.offset[ 1 ] );
				if ( data.center ) texture.center.set( data.center[ 0 ], data.center[ 1 ] );

				if ( data.wrap ) {
					texture.wrapS = data[ 'wrap' ][ 0 ];
					texture.wrapT = data[ 'wrap' ][ 1 ];
				}

				texture.rotation = data.rotation || 0;
				texture.encoding = data.encoding || LinearEncoding;
				texture.minFilter = data.minFilter || LinearMipMapLinearFilter;
				texture.magFilter = data.magFilter || LinearFilter;
				texture.anisotropy = data.anisotropy || 1;
				texture.flipY = data.flipY || true;
				texture.premultiplyAlpha = data.premultiplyAlpha || false;
				texture.unpackAlignment = data.unpackAlignment || 4;
				texture.format = data.format || RGBAFormat;
				texture.type = data.type || UnsignedByteType;

				AssetDatabase.setInstance( meta.guid, texture );
			}

		} );

	}

	loadMaterials () {

		AssetDatabase.getMetadataAll().forEach( meta => {

			if ( meta.importer == MetaImporter.MATERIAL && meta.guid != 'defaultMaterial' ) {

				const material = TvMaterial.parseString( this.fileService.fs.readFileSync( meta.path, 'utf-8' ) );

				AssetDatabase.setInstance( meta.guid, material );

			}

		} );

	}

	loadModels () {

		AssetDatabase.getMetadataAll().forEach( meta => {

			if ( meta.importer == MetaImporter.MODEL ) {

				// TODO: Async can also be an option
				this.modelImporterService.load( meta.path, ( obj ) => {

					AssetDatabase.setInstance( meta.guid, obj );

				}, meta );

			}

		} );

	}

	loadDefaultAssets () {

		const defaultMaterial = new MeshStandardMaterial( { name: 'DefaultMaterial' } );

		const meta = MetadataFactory.createMaterialMetadata( 'DefaultMaterial', 'defaultMaterial', 'Default.material' );

		AssetDatabase.setMetadata( meta.guid, meta );

		AssetDatabase.setInstance( meta.guid, defaultMaterial );

	}

	loadRoadStyles () {

		AssetDatabase.getMetadataAll().forEach( meta => {

			if ( meta.importer == MetaImporter.ROAD_STYLE ) {

				this.fileService.readAsync( meta.path ).then( contents => {

					const roadStyle = RoadStyleImporter.importFromString( contents );

					AssetDatabase.setInstance( meta.guid, roadStyle );

				} );
			}

		} );
	}

	loadRoadMarkings () {

		AssetDatabase.getMetadataAll().forEach( meta => {

			if ( meta.importer === MetaImporter.ROAD_MARKING ) {

				this.fileService.readAsync( meta.path ).then( contents => {

					const marking = TvRoadMarking.importFromString( contents );

					AssetDatabase.setInstance( meta.guid, marking );

				} );
			}

		} );

	}

	loadOpenDriveFiles () {

		AssetDatabase.getMetadataAll().forEach( meta => {

			if ( meta.importer == MetaImporter.OPENDRIVE ) {

				this.fileService.readAsync( meta.path ).then( contents => {

					AssetDatabase.setInstance( meta.guid, contents );

				} );

			}

		} );

	}

	loadOpenScenarioFiles () {

		AssetDatabase.getMetadataAll().forEach( meta => {

			if ( meta.importer == MetaImporter.OPENSCENARIO ) {

				this.fileService.readAsync( meta.path ).then( contents => {

					AssetDatabase.setInstance( meta.guid, contents );

				} );

			}

		} );

	}

	/**
	 *
	 * @param guid
	 * @deprecated use AssetCache instead
	 */
	find ( guid: string ): Metadata {

		return AssetDatabase.getMetadata( guid );

	}

	// updateAsset ( guid: string, data: any ) {

	//     try {

	//         const metadata = this.find( guid );

	//         this.writeMetafile( metadata.path, metadata );

	//     } catch ( error ) {

	//         SnackBar.error( "Error in updating asset" );

	//     }

	// }


	// reimportProject () {

	//     this.reimportFiles( this.fileService.readPathContentsSync( this.projectDir ) );

	// }

	// reimportFiles ( files: any[] ) {

	//     files.forEach( file => {

	//         const extension = FileService.getExtension( file.name );

	//         if ( file.type === 'file' && extension != 'meta' ) {

	//             this.reimport( file );

	//         }

	//         if ( file.type === 'directory' ) {

	//             const guid = Math.random().toString( 36 ).substring( 7 );

	//             const metadata = { guid: guid, isFolder: true, path: file.path, importer: null, data: null };

	//             this.writeMetafile( file, metadata );

	//             this.addMetafileInCache( guid, metadata );

	//             this.reimportFiles( this.fileService.readPathContentsSync( file.path ) );

	//         }

	//     } );
	// }

	// reimport ( file: { path: string, name: string }, extension?: string ) {

	//     const metadata = MetadataFactory.createMetadata( file.name, extension, file.path );

	//     if ( metadata ) {

	//         // this.writeMetafile( file.path, metadata );

	//         this.addMetafileInCache( metadata.guid, metadata );

	//     }
	// }

	// writeMetafile ( file: FileNode | string, metadata: Metadata ) {

	//     try {

	//         let path = null;

	//         if ( typeof ( file ) === 'string' ) path = file;

	//         if ( typeof ( file ) === 'object' ) path = file.path;

	//         if ( !path.includes( '.meta' ) ) path = path + '.meta';

	//         this.fileService.fs.writeFileSync( path, JSON.stringify( metadata ) );

	//     } catch ( error ) {

	//         console.error( error );

	//         SnackBar.error( "Error in writing .meta file. Please Reimport the asset.", "", 5000 );
	//     }

	// }

	loadDirectory ( files: any[] ) {

		files.forEach( file => {

			if ( file.type === 'file' && FileService.getExtension( file.name ) === 'meta' ) this.loadMetadata( file );

			if ( file.type === 'directory' ) {
				this.loadDirectory( this.fileService.readPathContentsSync( file.path ) );
			}

		} );

	}

	loadMetadata ( file ): void {

		// TODO: improve import pipeline
		// import texture
		// import materials
		// import models
		// import props, signs etc

		try {

			const metadata = this.fetchMetaFile( file );

			AssetDatabase.setMetadata( metadata.guid, metadata );

			// this.loadInstance( metadata.importer, metadata.guid, metadata.path );

		} catch ( error ) {

			console.error( error, file );

		}

	}

	loadModelFile ( guid: string, callback: ( object: Object3D ) => void ): void {

		try {

			const metadata = this.find( guid );

			this.modelImporterService.load( metadata.path, ( obj ) => {

				callback( obj );

			}, metadata );

		} catch ( error ) {

			console.error( error );

		}

	}

	// loadInstance ( importer: string, guid: string, path: string ): any {

	//     let instance = null;

	//     try {

	//         switch ( importer ) {

	//             case MetaImporter.TEXTURE: instance = new TextureLoader().load( path ); break;

	//             case MetaImporter.MATERIAL:
	//                 {
	//                     instance = TvMaterial.parseString( this.fileService.fs.readFileSync( path, 'utf-8' ) );
	//                 }
	//                 break;

	//             default: break;
	//         }

	//     } catch ( error ) {

	//         console.error( error );

	//     }

	//     if ( instance ) AssetCache.setInstance( guid, instance );

	//     return instance;
	// }

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

	hasMetaFile ( file: FileNode | string ): boolean {

		try {

			let path = null;

			if ( typeof ( file ) === 'string' ) path = file;

			if ( typeof ( file ) === 'object' ) path = file.path;

			if ( !path.includes( '.meta' ) ) path = path + '.meta';

			return this.fileService.fs.existsSync( path );

		} catch ( error ) {

			return false;

		}
	}

	getInstance ( guid: string ): any {

		return AssetDatabase.getInstance( guid );

	}

}

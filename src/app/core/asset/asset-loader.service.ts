/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MetadataFactory } from 'app/factories/metadata-factory.service';
import { TvPrefabLoader } from 'app/loaders/tv-prefab.loader';
import { TvRoadMarking } from 'app/modules/tv-map/services/marking-manager';
import { AssetNode } from 'app/views/editor/project-browser/file-node.model';
import {
	BufferGeometryLoader,
	LinearEncoding,
	LinearFilter,
	LinearMipMapLinearFilter,
	LinearSRGBColorSpace,
	MeshStandardMaterial,
	NoColorSpace,
	Object3D,
	RGBAFormat,
	SRGBColorSpace,
	TextureLoader,
	UnsignedByteType
} from 'three';
import { ModelImporterService } from '../../importers/model-importer.service';
import { Metadata, MetaImporter } from './metadata.model';
import { AssetDatabase } from './asset-database';
import { XmlElement } from "../../importers/xml.element";
import { StorageService } from 'app/io/storage.service';
import { FileUtils } from 'app/io/file-utils';
import { ProjectService } from 'app/services/project.service';

@Injectable( {
	providedIn: 'root'
} )
export class AssetLoaderService {

	/**
	 * This class is responsible to loading, caching, importing, reading .meta files.
	 */
	constructor (
		public modelImporterService: ModelImporterService,
		private storageService: StorageService,
		private projectService: ProjectService
	) {
	}

	private get projectDir () {
		return this.projectService.projectPath;
	}

	init () {

		this.loadDefaultAssets();

		const files = this.storageService.getDirectoryFiles( this.projectDir );

		this.loadDirectory( files );

		this.loadTextures();

		this.loadMaterials();

		this.loadModels();

		this.loadGeometries();

		this.loadPrefabs();

		this.loadEntities();

		this.loadRoadStyles();

		this.loadRoadMarkings();

		this.loadOpenDriveFiles();

		this.loadOpenScenarioFiles();

	}



	loadTextures () {

		AssetDatabase.getMetadataAll().forEach( meta => {

			if ( meta.importer === MetaImporter.TEXTURE ) {

				const data: XmlElement = meta.data;

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
				texture.colorSpace = SRGBColorSpace;
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

		// const materialLoader = new TvMaterialLoader();

		// AssetDatabase.getMetadataAll().forEach( meta => {

		// 	if ( meta.importer == MetaImporter.MATERIAL && meta.guid != 'defaultMaterial' ) {

		// 		const contents = this.storageService.readSync( meta.path );

		// 		const material = materialLoader.parseMaterial( JSON.parse( contents ) );

		// 		if ( material.guid != meta.guid ) {

		// 			Debug.log( 'material guid mismatch', meta.guid, material.guid );

		// 			material.guid = material.uuid = meta.guid;

		// 			AssetDatabase.setInstance( meta.guid, material );
		// 			AssetDatabase.setInstance( material.guid, material );
		// 		}

		// 		AssetDatabase.setInstance( meta.guid, material );

		// 	}

		// } );

	}

	loadGeometries () {

		const loader = new BufferGeometryLoader();

		AssetDatabase.getMetadataAll().forEach( meta => {

			if ( meta.importer == MetaImporter.GEOMETRY ) {

				const contents = this.storageService.readSync( meta.path );

				const json = JSON.parse( contents );

				const geometry = loader.parse( json );

				geometry.uuid = json.uuid;

				AssetDatabase.setInstance( meta.guid, geometry );

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

	loadPrefabs () {

		const loader = new TvPrefabLoader();

		AssetDatabase.getMetadataAll().forEach( meta => {

			if ( meta.importer == MetaImporter.PREFAB ) {

				const contents = this.storageService.readSync( meta.path );

				const prefab = loader.parsePrefab( JSON.parse( contents ) );

				if ( prefab.guid != meta.guid ) {

					console.error( 'Prefab guid mismatch', meta.guid, prefab.guid );

					prefab.guid = prefab.uuid = meta.guid;

					// AssetFactory.updatePrefab( meta.path, prefab );

					AssetDatabase.setInstance( meta.guid, prefab );

				} else {

					AssetDatabase.setInstance( meta.guid, prefab );
				}
			}

		} );

	}

	loadEntities () {

		// const entityLoader = new TvEntityLoader();

		// AssetDatabase.getMetadataAll().forEach( meta => {

		// 	if ( meta.importer == MetaImporter.ENTITY ) {

		// 		const contents = this.storageService.readSync( meta.path );

		// 		const entity = entityLoader.parseEntity( JSON.parse( contents ) );

		// 		AssetDatabase.setInstance( meta.guid, entity );

		// 	}

		// } );

	}

	loadDefaultAssets () {

		const defaultMaterial = new MeshStandardMaterial( { name: 'DefaultMaterial' } );

		const meta = MetadataFactory.createMaterialMetadata( 'DefaultMaterial', 'defaultMaterial', 'Default.material' );

		AssetDatabase.setMetadata( meta.guid, meta );

		AssetDatabase.setInstance( meta.guid, defaultMaterial );

	}

	loadRoadStyles () {

		// AssetDatabase.getMetadataAll().forEach( meta => {

		// 	if ( meta.importer == MetaImporter.ROAD_STYLE ) {

		// 		const contents = this.storageService.readSync( meta.path );

		// 		const roadStyle = RoadStyleImporter.importFromString( contents );

		// 		AssetDatabase.setInstance( meta.guid, roadStyle );

		// 	}

		// } );
	}

	loadRoadMarkings () {

		AssetDatabase.getMetadataAll().forEach( meta => {

			if ( meta.importer === MetaImporter.ROAD_MARKING ) {

				const contents = this.storageService.readSync( meta.path )

				const marking = TvRoadMarking.importFromString( contents );

				AssetDatabase.setInstance( meta.guid, marking );

			}

		} );

	}

	loadOpenDriveFiles () {

		AssetDatabase.getMetadataAll().forEach( meta => {

			if ( meta.importer == MetaImporter.OPENDRIVE ) {

				const contents = this.storageService.readSync( meta.path )

				AssetDatabase.setInstance( meta.guid, contents );

			}

		} );

	}

	loadOpenScenarioFiles () {

		AssetDatabase.getMetadataAll().forEach( meta => {

			if ( meta.importer == MetaImporter.OPENSCENARIO ) {

				const contents = this.storageService.readSync( meta.path )

				AssetDatabase.setInstance( meta.guid, contents );

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

	loadDirectory ( files: any[] ) {

		files.forEach( file => {

			if ( file.type === 'file' && FileUtils.getExtensionFromPath( file.name ) === 'meta' ) {

				try {

					const metadata = this.readMetaSync( file );

					AssetDatabase.setMetadata( metadata.guid, metadata );

				} catch ( error ) {

				}

			}

			if ( file.type === 'directory' ) {

				this.loadDirectory( this.storageService.getDirectoryFiles( file.path ) );

			}

		} );

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

	readMetaSync ( file: AssetNode | string ): Metadata {

		try {

			let path = null;

			if ( typeof ( file ) === 'string' ) path = file;

			if ( typeof ( file ) === 'object' ) path = file.path;

			if ( !path.includes( '.meta' ) ) path = path + '.meta';

			const contents = this.storageService.readSync( path );

			return JSON.parse( contents );

		} catch ( error ) {

			console.error( error, file );

			// SnackBar.error( "Error in reading .meta file. Please Reimport the asset.", "", 5000 );
		}

	}

	hasMetaFile ( file: AssetNode | string ): boolean {

		try {

			let path = null;

			if ( typeof ( file ) === 'string' ) path = file;

			if ( typeof ( file ) === 'object' ) path = file.path;

			if ( !path.includes( '.meta' ) ) path = path + '.meta';

			return this.storageService.exists( path );

		} catch ( error ) {

			return false;

		}
	}

	getInstance ( guid: string ): any {

		return AssetDatabase.getInstance( guid );

	}

}

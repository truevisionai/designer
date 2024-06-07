/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ProjectBrowserService } from '../project-browser/project-browser.service';
import { Asset, AssetType } from '../../../core/asset/asset.model';
import { DeprecatedModelLoader } from 'app/loaders/model.loader';
import { RoadStyleLoader } from 'app/graphics/road-style/road-style.loader';
import { EditorSettings } from 'app/services/editor/editor.settings';
import { BufferGeometryLoader } from 'three';
import { TvConsole } from 'app/core/utils/console';
import { TvObjectLoader } from "../../../graphics/object/tv-object.loader";
import { StorageService } from "../../../io/storage.service";
import { TvTextureService } from "../../../graphics/texture/tv-texture.service";
import { TvMaterialService } from "../../../graphics/material/tv-material.service";
import { AssetService } from "../../../core/asset/asset.service";
import { AssetDatabase } from "../../../core/asset/asset-database";
import { LoaderFactory } from "../../../factories/loader.factory";
import { MaterialAsset } from "../../../graphics/material/tv-material.asset";
import { EntityLoader } from 'app/scenario/entity/entity.loader';

@Injectable( {
	providedIn: 'root'
} )
export class LoadingService {

	public logs: string[] = [];

	private assets: Asset[] = [];

	constructor (
		private assetService: AssetService,
		private projectBrowserService: ProjectBrowserService,
		private modelLoader: DeprecatedModelLoader,
		private roadStyleLoader: RoadStyleLoader,
		private entityLoader: EntityLoader,
		private editorSettings: EditorSettings,
		private prefabLoader: TvObjectLoader,
		private storageService: StorageService,
		private textureService: TvTextureService,
		private materialService: TvMaterialService,
		private assetLoaderProvider: LoaderFactory,
	) {
	}

	loadProject ( path: string ) {

		this.loadFolder( path );

		this.loadTextures();

		this.loadMaterials();

		this.loadGeometries();

		this.loadModels();

		this.loadPrefabs();

		this.loadRoadStyles();

		this.loadEntities();

		this.loadSceneFiles();

		this.loadOpenDriveFiles();

		this.loadOpenScenarioFiles();

		this.editorSettings.loadSettings();
	}

	loadFolder ( path: string ) {

		const folder = new Asset( AssetType.DIRECTORY, path, path );

		this.projectBrowserService.getAssets( path ).forEach( asset => {

			this.assetService.addAsset( asset );

			this.assets.push( asset );

			folder.children.push( asset );

			// this.logs.push( 'Loading ' + asset.path );

		} );

		this.projectBrowserService.getFolders( path ).forEach( folder => {

			this.loadFolder( folder.path );

		} )

		this.assets.push( folder );

	}

	loadTextures () {

		const loader = this.assetLoaderProvider.getLoader( AssetType.TEXTURE );

		this.assets.filter( asset => asset.type == AssetType.TEXTURE ).forEach( asset => {

			const texture = loader.load( asset );

			if ( asset.guid != texture.guid ) {
				console.error( 'Texture guid mismatch', asset.guid, texture.guid, asset );
			}

			this.textureService.addTexture( texture.guid, texture );

		} );

	}

	loadMaterials () {

		const loader = this.assetLoaderProvider.getLoader( AssetType.MATERIAL );

		this.assets.filter( asset => asset.type == AssetType.MATERIAL ).forEach( asset => {

			const material = loader.load( asset );

			if ( !material ) return;

			if ( material.guid != asset.guid ) {

				console.warn( 'Material guid mismatch', asset.guid, material.guid, asset, material );

				this.updateMaterial( asset, material );

			}

			this.materialService.addMaterial( material );

		} )

	}

	loadModels () {

		this.assets.filter( asset => asset.type == AssetType.MODEL ).forEach( asset => {

			this.modelLoader.loadSync( asset.path, ( model ) => {

				AssetDatabase.setInstance( asset.metadata.guid, model );

			}, ( error ) => {

				TvConsole.error( error );

			} );

		} )

	}

	loadRoadStyles () {

		this.assets.filter( asset => asset.type == AssetType.ROAD_STYLE ).forEach( asset => {

			const roadStyle = this.roadStyleLoader.load( asset );

			AssetDatabase.setInstance( asset.metadata.guid, roadStyle );

		} )

	}

	loadEntities () {

		this.assets.filter( asset => asset.type == AssetType.ENTITY ).forEach( asset => {

			const entity = this.entityLoader.loadEntity( asset );

			AssetDatabase.setInstance( asset.metadata.guid, entity );

		} )

	}

	loadGeometries () {

		const loader = new BufferGeometryLoader();

		this.assets.filter( asset => asset.type == AssetType.GEOMETRY ).forEach( asset => {

			const contents = this.storageService.readSync( asset.path );

			const json = JSON.parse( contents );

			const geometry = loader.parse( json );

			geometry.uuid = json.uuid;

			AssetDatabase.setInstance( asset.guid, geometry );

		} )

	}

	loadPrefabs () {

		this.assets.filter( asset => asset.type == AssetType.OBJECT ).forEach( asset => {

			const objectAsset = this.prefabLoader.load( asset );

			if ( objectAsset.guid != asset.guid ) {
				console.error( 'Prefab guid mismatch', asset.guid, objectAsset.guid );
			}

			AssetDatabase.setInstance( asset.guid, objectAsset );

		} )

	}

	loadSceneFiles () {

		this.assets.filter( asset => asset.type == AssetType.SCENE ).forEach( asset => {

			AssetDatabase.setInstance( asset.guid, asset.metadata );

		} );

	}

	loadOpenDriveFiles () {

		this.assets.filter( asset => asset.type == AssetType.OPENDRIVE ).forEach( asset => {

			AssetDatabase.setInstance( asset.guid, asset.metadata );

		} );

		// AssetDatabase.getMetadataAll().forEach( meta => {

		// if ( meta.importer == MetaImporter.OPENDRIVE ) {

		// const contents = this.storageService.readSync( meta.path )

		// AssetDatabase.setInstance( meta.guid, contents );

		// }

		// } );

	}

	loadOpenScenarioFiles () {

		this.assets.filter( asset => asset.type == AssetType.OPENSCENARIO ).forEach( asset => {

			AssetDatabase.setInstance( asset.guid, asset.metadata );

		} );

		// AssetDatabase.getMetadataAll().forEach( meta => {

		// if ( meta.importer == MetaImporter.OPENSCENARIO ) {

		// const contents = this.storageService.readSync( meta.path )

		// AssetDatabase.setInstance( meta.guid, contents );

		// }

		// } );

	}

	loadRoadMarkings () {

		// AssetDatabase.getMetadataAll().forEach( meta => {

		// 	if ( meta.importer === MetaImporter.ROAD_MARKING ) {

		// 		const contents = this.storageService.readSync( meta.path )

		// 		const marking = TvRoadMarking.importFromString( contents );

		// 		AssetDatabase.setInstance( meta.guid, marking );

		// 	}

		// } );

	}

	private updateMaterial ( asset: Asset, material: MaterialAsset ) {

		if ( material instanceof MaterialAsset ) {

			material.setGuid( asset.guid );

			this.materialService.addMaterial( material );

			this.materialService.updateAsset( asset );

			console.log( asset, material );

		} else {

			console.error( 'Material is not an instance of MaterialAsset', material );

		}

	}
}

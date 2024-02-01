/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ProjectBrowserService } from '../project-browser/project-browser.service';
import { AssetNode, AssetType } from '../project-browser/file-node.model';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { TvMaterialLoader } from 'app/graphics/material/tv-material.loader';
import { TvTextureLoader } from 'app/graphics/texture/tv-texture.loader';
import { ModelLoader } from 'app/loaders/model.loader';
import { RoadStyleImporter } from 'app/loaders/tv-road-style-loader';
import { TvEntityLoader } from 'app/loaders/tv-entity.loader';
import { EditorSettings } from 'app/services/editor/editor.settings';
import { MeshStandardMaterial } from 'three';
import { TvConsole } from 'app/core/utils/console';
import { TvMaterialExporter } from 'app/graphics/material/tv-material.exporter';

@Injectable( {
	providedIn: 'root'
} )
export class LoadingService {

	public logs: string[] = [];

	private assets: AssetNode[] = [];

	constructor (
		private projectBrowserService: ProjectBrowserService,
		private materialLoader: TvMaterialLoader,
		private textureLoader: TvTextureLoader,
		private modelLoader: ModelLoader,
		private roadStyleLoader: RoadStyleImporter,
		private entityLoader: TvEntityLoader,
		private editorSettings: EditorSettings,
		private materialExporter: TvMaterialExporter,
	) {
	}

	loadProject ( path: string ) {

		this.loadFolder( path );

		this.loadTextures();

		this.loadMaterials();

		this.loadModels();

		this.loadRoadStyles();

		this.loadEntities();

		this.loadSceneFiles();

		this.loadOpenDriveFiles();

		this.loadOpenScenarioFiles();

		this.editorSettings.loadSettings();
	}

	loadFolder ( path: string ) {

		const folder = new AssetNode( AssetType.DIRECTORY, path, path );

		this.projectBrowserService.getAssets( path ).forEach( asset => {

			AssetDatabase.setMetadata( asset.metadata.guid, asset.metadata );

			this.assets.push( asset );

			folder.children.push( asset );

			// this.logs.push( 'Loading ' + asset.path );

		} );

		this.projectBrowserService.getFolders( path ).forEach( folder => {

			this.loadFolder( folder.path );

		} )

		this.assets.push( folder );

	}

	loadDefaultAssets () {

		const defaultMaterial = new MeshStandardMaterial( { name: 'DefaultMaterial' } );

		const meta = this.materialExporter.createMetadata( 'DefaultMaterial', 'defaultMaterial', 'Default.material' );

		AssetDatabase.setMetadata( meta.guid, meta );

		AssetDatabase.setInstance( meta.guid, defaultMaterial );

	}

	loadTextures () {

		this.assets.filter( asset => asset.type == AssetType.TEXTURE ).forEach( asset => {

			const texture = this.textureLoader.loadTexture( asset );

			AssetDatabase.setInstance( asset.metadata.guid, texture );

		} );

	}

	loadMaterials () {

		this.assets.filter( asset => asset.type == AssetType.MATERIAL ).forEach( asset => {

			const material = this.materialLoader.loadMaterial( asset );

			AssetDatabase.setInstance( asset.metadata.guid, material );

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

			const roadStyle = this.roadStyleLoader.loadAsset( asset );

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

		// const loader = new BufferGeometryLoader();

		// AssetDatabase.getMetadataAll().forEach( meta => {

		// 	if ( meta.importer == MetaImporter.GEOMETRY ) {

		// 		const contents = this.storageService.readSync( meta.path );

		// 		const json = JSON.parse( contents );

		// 		const geometry = loader.parse( json );

		// 		geometry.uuid = json.uuid;

		// 		AssetDatabase.setInstance( meta.guid, geometry );

		// 	}

		// } );

	}

	loadPrefabs () {

		// const loader = new TvPrefabLoader();

		// AssetDatabase.getMetadataAll().forEach( meta => {

		// 	if ( meta.importer == MetaImporter.PREFAB ) {

		// 		const contents = this.storageService.readSync( meta.path );

		// 		const prefab = loader.parsePrefab( JSON.parse( contents ) );

		// 		if ( prefab.guid != meta.guid ) {

		// 			console.error( 'Prefab guid mismatch', meta.guid, prefab.guid );

		// 			prefab.guid = prefab.uuid = meta.guid;

		// 			// AssetFactory.updatePrefab( meta.path, prefab );

		// 			AssetDatabase.setInstance( meta.guid, prefab );

		// 		} else {

		// 			AssetDatabase.setInstance( meta.guid, prefab );
		// 		}
		// 	}

		// } );

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

}

import { Injectable } from '@angular/core';
import { ProjectBrowserService } from '../project-browser/project-browser.service';
import { AssetNode, AssetType } from '../project-browser/file-node.model';
import { MetaImporter } from 'app/core/asset/metadata.model';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { TvMaterialLoader } from 'app/loaders/tv-material.loader';
import { TvTextureLoaderService } from 'app/loaders/tv-texture.loader';
import { ModelImporterService } from 'app/importers/model-importer.service';
import { RoadStyleImporter } from 'app/loaders/tv-road-style-loader';
import { TvEntityLoader } from 'app/loaders/tv-entity.loader';

@Injectable( {
	providedIn: 'root'
} )
export class LoadingService {

	private assets: AssetNode[] = [];

	constructor (
		private projectBrowserService: ProjectBrowserService,
		private materialLoader: TvMaterialLoader,
		private textureLoader: TvTextureLoaderService,
		private modelLoader: ModelImporterService,
		private roadStyleLoader: RoadStyleImporter,
		private entityLoader: TvEntityLoader,
	) { }

	loadProject ( path: string ) {

		this.loadFolder( path );

		this.loadTextures();

		this.loadMaterials();

		this.loadModels();

		this.loadRoadStyles();

		this.loadEntities();
	}


	loadFolder ( path: string ) {

		const folder = new AssetNode( AssetType.DIRECTORY, path, path );

		this.projectBrowserService.getAssets( path ).forEach( asset => {

			AssetDatabase.setMetadata( asset.metadata.guid, asset.metadata );

			this.assets.push( asset );

			folder.children.push( asset );

		} );

		this.projectBrowserService.getFolders( path ).forEach( folder => {

			this.loadFolder( folder.path );

		} )

		this.assets.push( folder );

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

			this.modelLoader.load( asset.path, ( model ) => {

				AssetDatabase.setInstance( asset.metadata.guid, model );

			}, asset.metadata );

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


}

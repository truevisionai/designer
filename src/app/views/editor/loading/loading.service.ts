import { Injectable } from '@angular/core';
import { ProjectBrowserService } from '../project-browser/project-browser.service';
import { AssetNode, AssetType } from '../project-browser/file-node.model';
import { MetaImporter } from 'app/core/asset/metadata.model';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { TvMaterialLoader } from 'app/loaders/tv-material.loader';
import { TvTextureLoaderService } from 'app/loaders/tv-texture.loader';
import { ModelImporterService } from 'app/importers/model-importer.service';
import { RoadStyleImporter } from 'app/loaders/tv-road-style-loader';

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
		private roadStyleLoader: RoadStyleImporter
	) { }

	loadProject ( path: string ) {

		this.loadFolder( path );

		this.loadTextures();

		this.loadMaterials();

		this.loadModels();

		this.loadRoadStyles();

	}

	loadFolder ( path: string ) {

		this.projectBrowserService.getFiles( path ).forEach( file => {

			this.loadFile( file );

		} );

		this.projectBrowserService.getFolders( path ).forEach( folder => {

			this.loadFolder( folder.path );

		} )

	}

	loadFile ( file: AssetNode ) {

		switch ( file.metadata.importer ) {

			case MetaImporter.TEXTURE: file.type = AssetType.TEXTURE; break;

			case MetaImporter.MATERIAL: file.type = AssetType.MATERIAL; break;

			case MetaImporter.MODEL: file.type = AssetType.MODEL; break;

			case MetaImporter.ROAD_STYLE: file.type = AssetType.ROAD_STYLE; break;

		}

		this.assets.push( file );
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

}

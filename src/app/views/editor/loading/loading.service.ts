import { Injectable } from '@angular/core';
import { ProjectBrowserService } from '../project-browser/project-browser.service';
import { AssetNode, AssetType } from '../project-browser/file-node.model';
import { MetaImporter } from 'app/core/asset/metadata.model';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { TvMaterialLoader } from 'app/loaders/tv-material.loader';
import { StorageService } from 'app/io/storage.service';
import { TvTextureLoaderService } from 'app/loaders/tv-texture.loader';

@Injectable( {
	providedIn: 'root'
} )
export class LoadingService {

	private assets: AssetNode[] = [];

	constructor (
		private projectBrowserService: ProjectBrowserService,
		private storageService: StorageService,
		private materialLoader: TvMaterialLoader,
		private textureLoader: TvTextureLoaderService,
	) { }

	loadProject ( path: string ) {

		this.loadFolder( path );

		this.assets.forEach( asset => { this.setAssetType( asset ) } )

		this.loadTextures();

		this.loadMaterials();

		// this.loadModels();

	}

	loadFolder ( path: string ) {

		this.projectBrowserService.getFiles( path ).forEach( file => {

			this.assets.push( file );

		} );

		this.projectBrowserService.getFolders( path ).forEach( folder => {

			this.loadFolder( folder.path );

		} )

	}

	setAssetType ( file: AssetNode ) {

		switch ( file.metadata.importer ) {

			case MetaImporter.TEXTURE: file.type = AssetType.TEXTURE; break;

			case MetaImporter.MATERIAL: file.type = AssetType.MATERIAL; break;

		}

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

}

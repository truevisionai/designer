/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { TvMaterial } from 'app/graphics/material/tv-material';
import { TvPrefab } from 'app/graphics/prefab/tv-prefab.model';
import { SnackBar } from 'app/services/snack-bar.service';
import { BufferGeometry, Texture } from 'three';
import { MetadataFactory } from '../../factories/metadata-factory.service';
import { StorageService } from 'app/io/storage.service';
import { SceneExporterService } from 'app/exporters/scene-exporter.service';
import { AssetNode, AssetType } from 'app/views/editor/project-browser/file-node.model';
import { ExporterService } from 'app/services/exporter.service';
import { Metadata } from './metadata.model';

/**
 * @deprecated
 */
@Injectable( {
	providedIn: 'root'
} )
export class DepAssetFactory {

	private static storageService: StorageService;

	private static sceneExporter: SceneExporterService;

	private static snackBar: SnackBar;

	constructor (
		storageService: StorageService,
		sceneExporter: SceneExporterService,
		snackBar: SnackBar
	) {
		DepAssetFactory.storageService = storageService;
		DepAssetFactory.sceneExporter = sceneExporter;
		DepAssetFactory.snackBar = snackBar;
	}

	static createNewFolder ( path: string, name: string = 'New Folder' ) {

		try {

			const result = this.storageService.createDirectory( path, name );

			const meta = MetadataFactory.createFolderMetadata( result.path );

			AssetDatabase.setInstance( meta.guid, meta );

			return result;

		} catch ( error ) {

			this.snackBar?.error( error );

		}

	}

	static updateMaterial ( path: string, material: TvMaterial ) {

		// const exporter = new MaterialExporter()

		// const value = JSON.stringify( exporter.exportJSON( material ), null, 2 );

		// this.storageService.writeSync( path, value );

	}

	static updateGeometry ( path: string, geometry: BufferGeometry ) {

		const contents = JSON.stringify( geometry.toJSON(), null, 2 );

		this.storageService.writeSync( path, contents );

	}

	static updatePrefab ( path: string, prefab: TvPrefab ) {

		const contents = JSON.stringify( prefab.toJSON(), null, 2 );

		this.storageService.writeSync( path, contents );

	}
}

@Injectable( {
	providedIn: 'root'
} )
export class AssetFactory {

	constructor (
		private storage: StorageService,
		private exporter: ExporterService,
	) {
	}

	createAsset ( asset: AssetNode, data: string ) {

		if ( data ) this.storage.writeSync( asset.path, data );

		this.createAssetMeta( asset );

	}

	createAssetMeta ( asset: AssetNode ) {

		if ( !asset.metadata ) return;

		this.storage.writeSync( asset.path + '.meta', JSON.stringify( asset.metadata ) );

	}

	saveAssetByGuid ( type: AssetType, guid: string, instance?: any ) {

		const metadata = AssetDatabase.getMetadata( guid );

		if ( !metadata ) return;

		if ( type == AssetType.TEXTURE ) {

			// for texture we dont need to update the asset file
			// only metadata file

		} else {

			const data = this.exporter.exportAsset( type, guid );

			if ( !data ) return;

			this.storage.writeSync( metadata.path, data );

		}

		this.updateMetaFile( metadata.path, metadata );

	}

	updateMetaFileByAsset ( asset: AssetNode ) {

		AssetDatabase.setMetadata( asset.metadata.guid, asset.metadata );

		this.updateMetaFile( asset.path, asset.metadata );

	}

	updateMetaFile ( path: string, metadata: Metadata ) {

		if ( !metadata ) return;

		this.storage.writeSync( path + '.meta', JSON.stringify( metadata ) );

	}

	getNameAndPath ( asset: AssetNode ): { name: string, path: string } {

		let name = asset.assetName;

		let path = asset.path;

		let count = 1;

		while ( this.storage.exists( path ) && count <= 20 ) {

			name = `${ asset.assetName }(${ count++ })`;

			if ( asset.isDirectory ) {

				path = this.storage.join( asset.directoryPath, name );

			} else {

				path = this.storage.join( asset.directoryPath, `${ name }.${ asset.extension }` );

			}

		}

		return { name, path };

	}

}

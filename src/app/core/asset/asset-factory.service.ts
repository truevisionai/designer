/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { VehicleEntity } from 'app/modules/scenario/models/entities/vehicle-entity';
import { TvMaterial } from 'app/modules/three-js/objects/tv-material.model';
import { TvPrefab } from 'app/modules/three-js/objects/tv-prefab.model';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvRoadMarking } from 'app/modules/tv-map/services/marking-manager';
import { SnackBar } from 'app/services/snack-bar.service';
import { BufferGeometry, Texture } from 'three';
import { MetadataFactory } from '../../factories/metadata-factory.service';
import { PropModel } from '../models/prop-model.model';
import { StorageService } from 'app/io/storage.service';
import { FileUtils } from 'app/io/file-utils';
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

	constructor (
		storageService: StorageService,
		sceneExporter: SceneExporterService
	) {
		DepAssetFactory.storageService = storageService;
		DepAssetFactory.sceneExporter = sceneExporter;
	}

	static copyAsset ( guid: string ) {

		const metadata = AssetDatabase.getMetadata( guid );

		const extension = FileUtils.getExtensionFromPath( metadata.path );

		const name = FileUtils.getFilenameFromPath( metadata.path ).replace( '.' + extension, '' );

		if ( extension == 'material' ) {

			const instance = AssetDatabase.getInstance<TvMaterial>( guid );

			const clone = instance.clone();

			AssetDatabase.setInstance( clone.guid, clone );

			AssetDatabase.setMetadata( clone.guid, metadata );

			clone.name = name + '_copy';

			const newPath = metadata.path.replace( name, clone.name );

			this.updateMaterial( newPath, clone );

		}

	}

	static updateAsset ( guid: any, data: any ) {

		const metadata = AssetDatabase.getMetadata( guid );

		if ( !metadata ) return;

		if ( data instanceof VehicleEntity ) {

			this.updateVehicleEntity( data, metadata.path );

		}

	}

	static getMeta ( guid: string ) {

		return AssetDatabase.getMetadata( guid );

	}

	static createNewScene ( path: string, filename: string = 'New Scene' ) {

		try {

			const scene = new TvMap();

			const contents = this.sceneExporter.export( scene );

			const destination = path + '/' + filename + '.scene';

			const result = this.storageService.writeSync( destination, contents );

			const meta = MetadataFactory.createMetadata( filename, 'scene', result.path );

			AssetDatabase.setInstance( meta.guid, scene );

		} catch ( error ) {

			SnackBar.error( error );

		}
	}

	static createNewFolder ( path: string, name: string = 'New Folder' ) {

		try {

			const result = this.storageService.createDirectory( path, name );

			const meta = MetadataFactory.createFolderMetadata( result.path );

			AssetDatabase.setInstance( meta.guid, meta );

			return result;

		} catch ( error ) {

			SnackBar.error( error );

		}

	}


	static updateVehicleEntity ( vehicle: VehicleEntity, path: string ) {

		const value = JSON.stringify( vehicle.toJSON(), null, 2 );

		this.storageService.writeSync( path, value );

	}

	static createNewRoadMarking ( path: string, name: string = 'NewRoadMarking' ) {

		try {

			// const marking = new TvRoadMarking( name, MarkingTypes.point, null );

			// const result = this.fileService.createFile( path, marking.name, TvRoadMarking.extension, marking.toJSONString() );

			// const meta = MetadataFactory.createMetadata( result.fileName, TvRoadMarking.extension, result.filePath );

			// AssetDatabase.setInstance( meta.guid, marking );

		} catch ( error ) {

			SnackBar.error( error );

		}

	}

	static updateRoadMarking ( path: string, marking: TvRoadMarking ) {

		try {

			this.storageService.writeSync( path, marking.toJSONString() );

		} catch ( error ) {

			SnackBar.error( error );

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

	static createNewSign ( name: string = 'NewSign', path: string ) {

		try {

			// const sign = new TvRoadSign( name, null );

			// const result = this.fileService.createFile( path, sign.name, 'sign', sign.toJSONString() );

			// const meta = MetadataFactory.createMetadata( result.fileName, 'sign', result.filePath );

			// AssetDatabase.setInstance( meta.guid, sign );

		} catch ( error ) {

			SnackBar.error( error );

		}

	}

	static updatePropModelByGuid ( guid: string, prop: PropModel ): void {

		const meta = this.getMeta( guid );

		this.storageService.writeSync( meta.path, JSON.stringify( prop ) );
	}

	static updateTexture ( guid: string, texture: Texture ): void {

		const meta = this.getMeta( guid );

		const json = MetadataFactory.createTextureMetadata( meta.guid, meta.path, texture );

		const contents = JSON.stringify( json, null, 2 );

		this.storageService.writeSync( meta.path + '.meta', contents );
	}

}


@Injectable( {
	providedIn: 'root'
} )
export class AssetFactory {

	constructor (
		private storage: StorageService,
		private exporter: ExporterService,
	) { }

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

	saveAssetFile ( asset: AssetNode ) {

		const data = this.exporter.exportAsset( asset.type, asset.metadata.guid );

		if ( !data ) return;

		this.updateAssetFile( asset, data );

	}

	updateAssetFile ( asset: AssetNode, json: string ) {

		this.storage.writeSync( asset.path, json );

		this.updateMetaFileByAsset( asset );

	}

	updateMetaFileByAsset ( asset: AssetNode ) {

		AssetDatabase.setMetadata( asset.metadata.guid, asset.metadata );

		this.updateMetaFile( asset.path, asset.metadata );

	}

	updateMetaFile ( path: string, metadata: Metadata ) {

		if ( !metadata ) return;

		this.storage.writeSync( path + '.meta', JSON.stringify( metadata ) );

	}

	deleteAsset ( asset: AssetNode ) {

		// this.storage.deleteSync( asset.path );

		// this.storage.deleteSync( asset.path + '.meta' );

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

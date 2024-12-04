/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { MetadataFactory } from 'app/factories/metadata-factory.service';
import { VehicleCategory } from 'app/scenario/models/tv-enums';
import { TvMap } from 'app/map/models/tv-map.model';
import { Asset, AssetType } from 'app/assets/asset.model';
import { AssetDatabase } from './asset-database';
import { TvConsole } from '../core/utils/console';
import { MathUtils, Object3D } from 'three';
import { SnackBar } from 'app/services/snack-bar.service';
import { StorageService } from 'app/io/storage.service';
import { FileUtils } from 'app/io/file-utils';
import { ExporterFactory } from "../factories/exporter.factory";
import { Metadata } from "./metadata.model";
import { TvObjectAsset } from "./object/tv-object.asset";
import { MaterialAsset } from "./material/tv-material.asset";
import { RoadStyle } from "./road-style/road-style.model";
import { TvStandardMaterial } from "./material/tv-standard-material";
import { TextureAsset } from './texture/tv-texture.model';

@Injectable( {
	providedIn: 'root'
} )
export class AssetService {

	private assets = new Map<string, Asset>();

	assetCreated = new EventEmitter<Asset>();

	constructor (
		private storageService: StorageService,
		private metadataFactory: MetadataFactory,
		private snackBar: SnackBar,
		private exporterFactory: ExporterFactory,
	) {
	}

	addAsset ( asset: Asset ): void {

		this.assets.set( asset.guid, asset );

		this.setMetadata( asset.guid, asset.metadata );

		if ( !asset.metadata ) {
			console.warn( 'Asset metadata is missing' );
		}

	}

	getAsset ( guid: string ): Asset {

		return this.assets.get( guid );

	}

	getTexture ( guid: string ): TextureAsset {

		return AssetDatabase.getTexture( guid );

	}

	getInstance<T> ( guid: string ): T {

		return AssetDatabase.getInstance<T>( guid );

	}

	getObjectAsset ( guid: string ): TvObjectAsset {

		return this.getInstance<TvObjectAsset>( guid );

	}

	getMaterialAsset ( guid: string ): MaterialAsset {

		return this.getInstance<MaterialAsset>( guid );

	}

	getModelAsset ( guid: string ): Object3D {

		return this.getInstance<Object3D>( guid );

	}

	getMetadata ( guid: string ): Metadata {

		return AssetDatabase.getMetadata( guid );

	}

	setMetadata ( guid: string, metadata: Metadata ): void {

		AssetDatabase.setMetadata( guid, metadata );

	}

	setInstance ( guid: string, instance: any ): void {

		AssetDatabase.setInstance( guid, instance );

	}

	updateSceneAsset ( path: string, scene: TvMap ): void {

		const exporter = this.exporterFactory.getExporter( AssetType.SCENE );

		if ( !exporter ) return;

		const data = exporter.exportAsString( scene );

		this.storageService.writeSync( path, data );

	}

	createNewAsset ( type: AssetType, filename: string, directory: string, data?: string, instance?: any, guid?: string ): Asset {

		const fullPath = this.storageService.join( directory, filename );

		const asset = new Asset( type, filename, fullPath );

		if ( type != AssetType.DIRECTORY ) {

			const response = this.getNameAndPath( asset );

			asset.name = response.name;

			asset.path = response.path;

		}

		asset.metadata = this.metadataFactory.makeAssetMetadata( asset, guid );

		this.writeAssetFile( asset, data );

		AssetDatabase.setInstance( asset.guid, instance );

		this.addAsset( asset );

		this.assetCreated.emit( asset );

		return asset;
	}

	createSceneAsset ( directory: string, instance?: TvMap, filename: string = 'Scene.scene' ): Asset | null {

		const scene = instance || new TvMap();

		const exporter = this.exporterFactory.getExporter( AssetType.SCENE );

		const data = exporter.exportAsString( scene );

		return this.createNewAsset( AssetType.SCENE, filename, directory, data, scene );

	}

	createRoadStyleAsset ( directory: string, style: RoadStyle, filename: string = 'RoadStyle.roadstyle' ): Asset {

		const exporter = this.exporterFactory.getExporter( AssetType.ROAD_STYLE );

		const data = exporter.exportAsString( style );

		return this.createNewAsset( AssetType.ROAD_STYLE, filename, directory, data, style );

	}

	createFolderAsset ( path: string, name: string = 'Untitled' ): void {

		const response = this.storageService.createDirectory( path, name );

		const folderName = FileUtils.getFilenameFromPath( response.path );

		this.createNewAsset( AssetType.DIRECTORY, folderName, path );

	}

	createMaterialAsset ( path: string, name: string = 'Material.material', material: MaterialAsset ): Asset {

		const exporter = this.exporterFactory.getExporter( AssetType.MATERIAL );

		const data = exporter.exportAsString( material );

		return this.createNewAsset( AssetType.MATERIAL, name, path, data, material, material.guid );

	}

	createEntityAsset ( path: string, category: VehicleCategory = VehicleCategory.car ): void {

		// TODO: implement entity creation

		// const entity = this.entityService.createVehicleByType( category );

		// const data = this.exporterFactory.getExporter( AssetType.ENTITY ).exportAsString( entity );

		// this.createNewAsset( AssetType.ENTITY, entity.name + '.entity', path, data, entity );

	}

	saveAssetByGuid ( type: AssetType, guid: string, object: any ): void {

		const metadata = AssetDatabase.getMetadata( guid );

		if ( !metadata ) return;

		if ( type == AssetType.TEXTURE ) {

			// for texture we dont need to update the assets file
			// only metadata file

		} else {

			const data = this.getAssetContent( type, guid );

			if ( !data ) return;

			this.storageService.writeSync( metadata.path, data );

		}

		this.updateMetaFile( metadata.path, metadata );

	}

	saveAsset ( data: Asset ): void {

		this.saveAssetByGuid( data.type, data.metadata.guid, AssetDatabase.getInstance( data.metadata.guid ) );

	}

	copyAsset ( asset: Asset ): void {

		const cloneName = asset.assetName + '_copy';

		if ( asset.type == AssetType.MATERIAL ) {

			const instance = AssetDatabase.getInstance<TvStandardMaterial>( asset.metadata.guid );

			const clone = instance.clone();

			clone.guid = clone.uuid = MathUtils.generateUUID();

			// const newPath = assets.metadata.path.replace( assets.name, clone.name );

			// const data = this.createMaterialAsset( newPath, clone );

		}

	}

	renameAsset ( asset: Asset, name: string ): void {

		if ( asset.children.length > 0 ) {

			this.snackBar.warn( 'Cannot rename folder or assets with children' );

			return;
		}

		const currentFolder = FileUtils.getDirectoryFromPath( asset.path );

		const newPath = this.storageService.join( currentFolder, name );

		const oldPath = asset.path;

		try {

			this.storageService.renameSync( oldPath, newPath );

			this.storageService.deleteFileSync( oldPath + '.meta' );

			asset.name = name;

			asset.path = newPath;

			this.updateMetaFileByAsset( asset );

		} catch ( error ) {

			TvConsole.error( error );

		}

	}

	deleteAsset ( asset: Asset ): boolean {

		if ( asset.children.length > 0 ) {

			this.snackBar.warn( 'Cannot delete folder or assets with children' );

			return false;
		}

		if ( asset.type == AssetType.DIRECTORY ) {

			this.deleteFolder( asset );

		} else {

			this.deleteFile( asset );

		}

		this.deleteMetadata( asset )

		return true;
	}

	private deleteFolder ( asset: Asset ): void {

		try {

			this.storageService.deleteFolderSync( asset.path );

			asset.isDeleted = true;

		} catch ( error ) {

			TvConsole.error( error );

		}

	}

	private deleteFile ( asset: Asset ): void {

		try {

			this.storageService.deleteFileSync( asset.path );

			asset.isDeleted = true;

		} catch ( error ) {

			TvConsole.error( error );

		}

	}

	private deleteMetadata ( asset: Asset ): void {

		try {

			this.storageService.deleteFileSync( asset.path + '.meta' );

		} catch ( error ) {

			TvConsole.error( error );

		}

		asset.isDeleted = true;

		AssetDatabase.removeInstance( asset.metadata.guid );

		AssetDatabase.removeMetadata( asset.metadata.guid );

	}

	moveAsset ( asset: Asset, folder: Asset ): void {

		const newPath = this.storageService.join( folder.path, asset.name );

		const oldPath = asset.path;

		this.storageService.renameSync( oldPath, newPath );

		this.storageService.deleteFileSync( oldPath + '.meta' );

		asset.path = newPath;

		this.updateMetaFileByAsset( asset );

	}

	private writeAssetFile ( asset: Asset, data: string ): void {

		if ( data ) this.storageService.writeSync( asset.path, data );

		this.writeAssetMetaFile( asset );

	}

	private writeAssetMetaFile ( asset: Asset ): void {

		if ( !asset.metadata ) return;

		this.storageService.writeSync( asset.path + '.meta', JSON.stringify( asset.metadata ) );

	}

	updateMetaFileByAsset ( asset: Asset ): void {

		AssetDatabase.setMetadata( asset.metadata.guid, asset.metadata );

		this.updateMetaFile( asset.path, asset.metadata );

	}

	updateMetaFile ( path: string, metadata: Metadata ): void {

		if ( !metadata ) return;

		this.storageService.writeSync( path + '.meta', JSON.stringify( metadata ) );

	}

	getNameAndPath ( asset: Asset ): { name: string, path: string } {

		let name = asset.assetName;

		let path = asset.path;

		let count = 1;

		while ( this.storageService.exists( path ) && count <= 20 ) {

			name = `${ asset.assetName }(${ count++ })`;

			if ( asset.isDirectory ) {

				path = this.storageService.join( asset.directoryPath, name );

			} else {

				path = this.storageService.join( asset.directoryPath, `${ name }.${ asset.extension }` );

			}

		}

		return { name, path };

	}

	getAssetContent ( assetType: AssetType, assetGuid: string ): string {

		const exporter = this.exporterFactory.getExporter( assetType )

		const output = exporter.exportAsString( this.getInstance( assetGuid ) );

		return output;
	}

	getAssetName ( guid: string ): string {

		return AssetDatabase.getAssetNameByGuid( guid );

	}

	getRoadStyleAsset ( guid: string ): RoadStyle {

		return this.getInstance<RoadStyle>( guid );

	}
}

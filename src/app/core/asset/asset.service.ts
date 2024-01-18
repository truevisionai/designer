import { EventEmitter, Injectable } from '@angular/core';
import { MetadataFactory } from 'app/factories/metadata-factory.service';
import { VehicleFactory } from 'app/factories/vehicle.factory';
import { VehicleCategory } from 'app/modules/scenario/models/tv-enums';
import { TvMaterial } from 'app/modules/three-js/objects/tv-material.model';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvRoadSign } from 'app/modules/tv-map/models/tv-road-sign.model';
import { ExporterService } from 'app/services/exporter.service';
import { AssetType, AssetNode } from 'app/views/editor/project-browser/file-node.model';
import { AssetFactory } from './asset-factory.service';
import { AssetDatabase } from './asset-database';
import { TvConsole } from '../utils/console';
import { MathUtils } from 'three';
import { RoadStyle } from './road.style';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SnackBar } from 'app/services/snack-bar.service';
import { StorageService } from 'app/io/storage.service';
import { FileUtils } from 'app/io/file-utils';

@Injectable( {
	providedIn: 'root'
} )
export class AssetService {

	assetCreated = new EventEmitter<AssetNode>();

	constructor (
		private exporter: ExporterService,
		private storageService: StorageService,
		private metadataFactory: MetadataFactory,
		private assetFactory: AssetFactory,
		private snackBar: SnackBar
	) {
	}

	getAssetInstance<T> ( asset: AssetNode ): T {

		return AssetDatabase.getInstance( asset.metadata.guid );

	}

	updateSceneAsset ( path: string, scene: TvMap ): void {

		const data = this.exporter.getSceneExport( scene );

		this.storageService.writeSync( path, data );

	}

	createNewAsset ( type: AssetType, filename: string, directory: string, data?: string, instance?: any ) {

		const fullPath = this.storageService.join( directory, filename );

		const asset = new AssetNode( type, filename, fullPath );

		if ( type != AssetType.DIRECTORY ) {

			const response = this.assetFactory.getNameAndPath( asset );

			asset.name = response.name;

			asset.path = response.path;

		}

		asset.metadata = this.metadataFactory.makeAssetMetadata( asset );

		this.assetFactory.createAsset( asset, data );

		AssetDatabase.setInstance( asset.metadata.guid, instance );

		this.assetCreated.emit( asset );

		return asset;
	}

	createSceneAsset ( directory: string, instance?: TvMap, filename: string = 'Scene.scene' ) {

		const scene = instance || new TvMap();

		const data = this.exporter.getSceneExport( scene );

		return this.createNewAsset( AssetType.SCENE, filename, directory, data, scene );

	}

	createRoadStyleAsset ( directory: string, style: TvRoad | RoadStyle, filename: string = 'RoadStyle.roadstyle' ) {

		const data = this.exporter.getRoadStyleExport( style );

		return this.createNewAsset( AssetType.ROAD_STYLE, filename, directory, data, style );

	}

	createFolderAsset ( path: string, name: string = 'Untitled' ) {

		const response = this.storageService.createDirectory( path, name );

		const folderName = FileUtils.getFilenameFromPath( response.path );

		this.createNewAsset( AssetType.DIRECTORY, folderName, path );

	}

	createMaterialAsset ( path: string, instance?: TvMaterial ) {

		const material = instance || new TvMaterial();

		const data = this.exporter.getMaterialExport( material );

		return this.createNewAsset( AssetType.MATERIAL, 'Material.material', path, data, material );

	}

	createSignAsset ( path: string ) {

		const sign = new TvRoadSign( 'Sign', null );

		const data = this.exporter.getRoadSignExport( sign );

		this.createNewAsset( AssetType.ROAD_SIGN, 'Sign.sign', path, data, sign );
	}

	createEntityAsset ( path: string, category: VehicleCategory = VehicleCategory.car ): void {

		const entity = VehicleFactory.createVehicle( category );

		const data = this.exporter.getVehicleExport( entity );

		this.createNewAsset( AssetType.ENTITY, entity.name + '.entity', path, data, entity );

	}

	saveAssetByGuid ( type: AssetType, guid: string, object: any ) {

		this.assetFactory.saveAssetByGuid( type, guid, object );

	}

	saveAsset ( data: AssetNode ) {

		this.saveAssetByGuid( data.type, data.metadata.guid, AssetDatabase.getInstance( data.metadata.guid ) );

	}

	copyAsset ( asset: AssetNode ) {

		const cloneName = asset.assetName + '_copy';

		if ( asset.type == AssetType.MATERIAL ) {

			const instance = AssetDatabase.getInstance<TvMaterial>( asset.metadata.guid );

			const clone = instance.clone();

			clone.guid = clone.uuid = MathUtils.generateUUID();

			// const newPath = asset.metadata.path.replace( asset.name, clone.name );

			// const data = this.createMaterialAsset( newPath, clone );

		}

	}

	renameAsset ( asset: AssetNode, name: string ) {

		if ( asset.children.length > 0 ) {

			this.snackBar.warn( 'Cannot rename folder or asset with children' );

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

			this.assetFactory.updateMetaFileByAsset( asset );

		} catch ( error ) {

			TvConsole.error( error );

		}

	}

	deleteAsset ( asset: AssetNode ): boolean {

		if ( asset.children.length > 0 ) {

			this.snackBar.warn( 'Cannot delete folder or asset with children' );

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

	private deleteFolder ( asset: AssetNode ) {

		try {

			this.storageService.deleteFolderSync( asset.path );

			asset.isDeleted = true;

		} catch ( error ) {

			TvConsole.error( error );

		}

	}

	private deleteFile ( asset: AssetNode ) {

		try {

			this.storageService.deleteFileSync( asset.path );

			asset.isDeleted = true;

		} catch ( error ) {

			TvConsole.error( error );

		}

	}

	private deleteMetadata ( asset: AssetNode ) {

		try {

			this.storageService.deleteFileSync( asset.path + '.meta' );

		} catch ( error ) {

			TvConsole.error( error );

		}

		asset.isDeleted = true;

		AssetDatabase.removeInstance( asset.metadata.guid );

		AssetDatabase.removeMetadata( asset.metadata.guid );

	}

}

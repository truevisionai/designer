import { EventEmitter, Injectable } from '@angular/core';
import { MetadataFactory } from 'app/factories/metadata-factory.service';
import { VehicleFactory } from 'app/factories/vehicle.factory';
import { FileService } from 'app/io/file.service';
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

@Injectable( {
	providedIn: 'root'
} )
export class AssetService {


	assetCreated = new EventEmitter<AssetNode>();

	constructor (
		private exporter: ExporterService,
		private fileService: FileService,
		// private storageService: StorageService,
		private metadataFactory: MetadataFactory,
		private assetFactory: AssetFactory,
	) { }

	getAssetInstance<T> ( asset: AssetNode ): T {

		return AssetDatabase.getInstance( asset.metadata.guid );

	}

	createNewAsset ( type: AssetType, filename: string, directory: string, data?: string, instance?: any ) {

		const fullPath = this.fileService.join( directory, filename );

		const asset = new AssetNode( type, filename, fullPath );

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

	createFolderAsset ( path: string, name: string = 'Folder' ) {

		const folder = this.fileService.createFolder( path, name );

		this.createNewAsset( AssetType.DIRECTORY, folder.name, path );

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

	deleteAsset ( asset: AssetNode ) {

		if ( asset.type == AssetType.DIRECTORY ) {

			this.deleteFolder( asset );

		} else {

			this.deleteFile( asset );

		}

		this.deleteMetadata( asset )

	}

	private deleteFolder ( asset: AssetNode ) {

		try {

			this.fileService.deleteFolderRecursive( asset.path );

		} catch ( error ) {

			TvConsole.error( error );

		}

	}

	private deleteFile ( asset: AssetNode ) {

		try {

			this.fileService.deleteFileSync( asset.path );

		} catch ( error ) {

			TvConsole.error( error );

		}

	}

	private deleteMetadata ( asset: AssetNode ) {

		try {

			this.fileService.deleteFileSync( asset.path + '.meta' );

		} catch ( error ) {

			TvConsole.error( error );

		}

		asset.isDeleted = true;

		AssetDatabase.removeInstance( asset.metadata.guid );

		AssetDatabase.removeMetadata( asset.metadata.guid );

	}

}

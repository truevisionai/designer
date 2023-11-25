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
import { AssetFactoryNew } from './asset-factory.service';
import { AssetDatabase } from './asset-database';

@Injectable( {
	providedIn: 'root'
} )
export class AssetService {

	assetCreated = new EventEmitter<AssetNode>();

	constructor (
		private exporter: ExporterService,
		private fileService: FileService,
		private metadataFactory: MetadataFactory,
		private assetFactory: AssetFactoryNew,
	) { }

	createNewAsset ( type: AssetType, name: string, path: string, data?: string, instance?: any ) {

		const fullPath = this.fileService.join( path, name );

		const asset = new AssetNode( type, name, fullPath );

		asset.metadata = this.metadataFactory.makeAssetMetadata( asset );

		this.assetFactory.createAsset( asset, data );

		AssetDatabase.setInstance( asset.metadata.guid, instance );

		this.assetCreated.emit( asset );

		return asset;
	}

	createSceneAsset ( path: string, instance?: TvMap ) {

		const scene = instance || new TvMap();

		const data = this.exporter.getSceneExport( scene );

		this.createNewAsset( AssetType.SCENE, 'Scene.scene', path, data, scene );
	}

	createFolderAsset ( path: string ) {

		const folder = this.fileService.createFolder( path, 'Folder' );

		this.createNewAsset( AssetType.DIRECTORY, folder.name, path );

	}

	createMaterialAsset ( path: string, material?: TvMaterial ) {

		const instance = material || new TvMaterial();

		const data = this.exporter.getMaterialExport( material );

		return this.createNewAsset( AssetType.MATERIAL, 'Material.material', path, data, instance );

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

}

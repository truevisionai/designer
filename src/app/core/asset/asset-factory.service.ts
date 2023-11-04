/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { FileService } from 'app/io/file.service';
import { VehicleEntity } from 'app/modules/scenario/models/entities/vehicle-entity';
import { TvMaterial } from 'app/modules/three-js/objects/tv-material.model';
import { TvPrefab } from 'app/modules/three-js/objects/tv-prefab.model';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvRoadSign } from 'app/modules/tv-map/models/tv-road-sign.model';
import { MarkingTypes, TvRoadMarking } from 'app/modules/tv-map/services/tv-marking.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { BufferGeometry, Texture } from 'three';
import { MetadataFactory } from '../../factories/metadata-factory.service';
import { PropModel } from '../models/prop-model.model';
import { AppService } from '../../services/app.service';

@Injectable( {
	providedIn: 'root'
} )
export class AssetFactory {

	private static get fileService (): FileService {

		return AppService.file;

	}

	static copyAsset ( guid: string ) {

		const metadata = AssetDatabase.getMetadata( guid );

		const extension = FileService.getExtension( metadata.path );

		const name = FileService.getFilenameFromPath( metadata.path ).replace( '.' + extension, '' );

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

	static createNewScene ( path: string, name: string = 'New Scene' ) {

		try {

			const scene = new TvMap();

			const result = this.fileService.createFile( path, name, 'scene', AppService.exporter.export( scene ) );

			const meta = MetadataFactory.createMetadata( result.fileName, 'scene', result.filePath );

			AssetDatabase.setInstance( meta.guid, scene );

		} catch ( error ) {

			SnackBar.error( error );

		}
	}

	static createNewFolder ( path: string, name: string = 'New Folder' ) {

		try {

			const result = this.fileService.createFolder( path, name );

			const meta = MetadataFactory.createFolderMetadata( result.path );

			AssetDatabase.setInstance( meta.guid, meta );

			return result;

		} catch ( error ) {

			SnackBar.error( error );

		}

	}

	static createNewMaterial ( path: string, name: string = 'NewMaterial' ) {

		try {

			const material = TvMaterial.new();

			const result = this.fileService.createFile( path, material.name, 'material', material.toJSONString() );

			const meta = MetadataFactory.createMetadata( result.fileName, 'material', result.filePath );

			AssetDatabase.setInstance( meta.guid, material );

		} catch ( error ) {

			SnackBar.error( error );

		}

	}

	static createVehicleEntity ( path: string, vehicle: VehicleEntity ) {

		try {

			const contents = JSON.stringify( vehicle.toJSON() );

			const result = this.fileService.createFile( path, vehicle.name, 'entity', contents );

			const meta = MetadataFactory.createMetadata( result.fileName, 'entity', result.filePath, vehicle.uuid );

			AssetDatabase.setInstance( meta.guid, vehicle );

		} catch ( error ) {

			SnackBar.error( error );

		}

	}

	static updateVehicleEntity ( vehicle: VehicleEntity, path: string ) {

		const value = JSON.stringify( vehicle.toJSON(), null, 2 );

		this.fileService.fs.writeFileSync( path, value );

	}

	static createNewRoadMarking ( path: string, name: string = 'NewRoadMarking' ) {

		try {

			const marking = new TvRoadMarking( name, MarkingTypes.point, null );

			const result = this.fileService.createFile( path, marking.name, TvRoadMarking.extension, marking.toJSONString() );

			const meta = MetadataFactory.createMetadata( result.fileName, TvRoadMarking.extension, result.filePath );

			AssetDatabase.setInstance( meta.guid, marking );

		} catch ( error ) {

			SnackBar.error( error );

		}

	}

	static updateRoadMarking ( path: string, marking: TvRoadMarking ) {

		try {

			this.fileService.fs.writeFileSync( path, marking.toJSONString() );

		} catch ( error ) {

			SnackBar.error( error );

		}

	}

	static updateMaterial ( path: string, material: TvMaterial ) {

		const value = JSON.stringify( material.toJSON(), null, 2 );

		this.fileService.fs.writeFileSync( path, value );

	}

	static updateGeometry ( path: string, geometry: BufferGeometry ) {

		const contents = JSON.stringify( geometry.toJSON(), null, 2 );

		this.fileService.fs.writeFileSync( path, contents );

	}

	static updatePrefab ( path: string, prefab: TvPrefab ) {

		const contents = JSON.stringify( prefab.toJSON(), null, 2 );

		this.fileService.fs.writeFileSync( path, contents );

	}

	static createNewSign ( name: string = 'NewSign', path: string ) {

		try {

			const sign = new TvRoadSign( name, null );

			const result = this.fileService.createFile( path, sign.name, 'sign', sign.toJSONString() );

			const meta = MetadataFactory.createMetadata( result.fileName, 'sign', result.filePath );

			AssetDatabase.setInstance( meta.guid, sign );

		} catch ( error ) {

			SnackBar.error( error );

		}

	}

	static updatePropModelByGuid ( guid: string, prop: PropModel ): void {

		const meta = this.getMeta( guid );

		this.fileService.fs.writeFileSync( meta.path, JSON.stringify( prop ) );
	}

	static updateTexture ( guid: string, texture: Texture ): void {

		const meta = this.getMeta( guid );

		const json = MetadataFactory.createTextureMetadata( meta.guid, meta.path, texture );

		const contents = JSON.stringify( json, null, 2 );

		this.fileService.fs.writeFileSync( meta.path + '.meta', contents );
	}

}

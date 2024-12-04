/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetDatabase } from 'app/assets/asset-database';
import { FileUtils } from 'app/io/file-utils';
import { FileService } from 'app/io/file.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { Asset, AssetType } from 'app/assets/asset.model';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { Metadata, MetaImporter } from '../assets/metadata.model';
import { TvRoadMarking } from "../deprecated/tv-road-marking";
import { RoadStyle } from "../assets/road-style/road-style.model";

@Injectable( {
	providedIn: 'root'
} )
export class MetadataFactory {

	private static fileService: FileService;

	private static snackBar: SnackBar;

	constructor (
		fileService: FileService,
		snackBar: SnackBar,
	) {

		MetadataFactory.fileService = fileService;
		MetadataFactory.snackBar = snackBar;

	}

	makeAssetMetadata ( asset: Asset, guid?: string ): Metadata {

		if ( asset.type == AssetType.DIRECTORY ) {

			return MetadataFactory.createFolderMetadata( asset.path );

		} else {

			return this.makeMetadata( asset.name, asset.extension, asset.path, guid );

		}

	}

	makeMetadata ( fileName: string, ext: string, path: string, gguid?: string ): Metadata {

		const extension = ext || FileUtils.getExtensionFromPath( path );

		const guid = gguid || THREE.MathUtils.generateUUID();

		let metadata: Metadata;

		switch ( extension ) {

			case 'scene':
				metadata = MetadataFactory.createSceneMetadata( fileName, guid, path );
				break;

			case 'obj':
				metadata = MetadataFactory.createModelMetadata( fileName, guid, path );
				break;

			case 'fbx':
				metadata = MetadataFactory.createModelMetadata( fileName, guid, path );
				break;

			case 'gltf':
				metadata = MetadataFactory.createModelMetadata( fileName, guid, path );
				break;

			case 'glb':
				metadata = MetadataFactory.createModelMetadata( fileName, guid, path );
				break;

			case 'xodr':
				metadata = MetadataFactory.createOpenDriveMetadata( fileName, guid, path );
				break;

			case 'xosc':
				metadata = MetadataFactory.createOpenScenarioMetadata( fileName, guid, path );
				break;

			case 'material':
				metadata = MetadataFactory.createMaterialMetadata( fileName, guid, path );
				break;

			case 'geometry':
				metadata = MetadataFactory.createGeometryMetadata( fileName, guid, path );
				break;

			case 'prefab':
				metadata = MetadataFactory.createPrefabMetadata( fileName, guid, path );
				break;

			case 'object':
				metadata = MetadataFactory.createObjectMetadata( fileName, guid, path );
				break;

			case 'sign':
				metadata = MetadataFactory.createSignMetadata( fileName, guid, path );
				break;

			case TvRoadMarking.extension:
				metadata = MetadataFactory.createRoadMarkingMetadata( fileName, guid, path );
				break;

			case RoadStyle.extension:
				metadata = MetadataFactory.createRoadStyleMetadata( fileName, guid, path );
				break;

			case 'entity':
				metadata = MetadataFactory.createEntityMetadata( fileName, guid, path );
				break;

		}

		return metadata;

	}

	static saveMetadataFile ( file: Asset | string, metadata: Metadata ): void {

		try {

			let path = null;

			if ( typeof ( file ) === 'string' ) path = file;

			if ( typeof ( file ) === 'object' ) path = file.path;

			if ( !path.includes( '.meta' ) ) path = path + '.meta';

			this.fileService.fs.writeFileSync( path, JSON.stringify( metadata, null, 2 ) );

		} catch ( error ) {

			console.error( 'Error in writing .meta file', error );

			this.snackBar?.error( 'Error in writing .meta file. Please Reimport the assets.', '', 5000 );
		}

	}

	static createMetadataFormPath ( destinationPath: string ): Metadata {

		const filename = FileUtils.getFilenameFromPath( destinationPath );

		const extension = FileUtils.getExtensionFromPath( destinationPath );

		return this.createMetadata( filename, extension, destinationPath );

	}

	static createMetadata ( fileName: string, ext: string, path: string, gguid?: string ): Metadata {

		const extension = ext || FileUtils.getExtensionFromPath( path );

		const guid = gguid || THREE.MathUtils.generateUUID();

		let metadata: Metadata;

		switch ( extension ) {

			case 'scene':
				metadata = this.createSceneMetadata( fileName, guid, path );
				break;

			case 'obj':
				metadata = this.createModelMetadata( fileName, guid, path );
				break;

			case 'fbx':
				metadata = this.createModelMetadata( fileName, guid, path );
				break;

			case 'gltf':
				metadata = this.createModelMetadata( fileName, guid, path );
				break;

			case 'glb':
				metadata = this.createModelMetadata( fileName, guid, path );
				break;

			case 'xodr':
				metadata = this.createOpenDriveMetadata( fileName, guid, path );
				break;

			case 'xosc':
				metadata = this.createOpenScenarioMetadata( fileName, guid, path );
				break;

			case 'material':
				metadata = this.createMaterialMetadata( fileName, guid, path );
				break;

			case 'geometry':
				metadata = this.createGeometryMetadata( fileName, guid, path );
				break;

			case 'prefab':
				metadata = this.createPrefabMetadata( fileName, guid, path );
				break;

			case 'object':
				metadata = this.createObjectMetadata( fileName, guid, path );
				break;

			case 'sign':
				metadata = this.createSignMetadata( fileName, guid, path );
				break;

			case TvRoadMarking.extension:
				metadata = this.createRoadMarkingMetadata( fileName, guid, path );
				break;

			case RoadStyle.extension:
				metadata = this.createRoadStyleMetadata( fileName, guid, path );
				break;

			case 'entity':
				metadata = this.createEntityMetadata( fileName, guid, path );
				break;

		}

		if ( metadata ) this.saveMetadataFile( path, metadata );

		if ( metadata ) AssetDatabase.setMetadata( guid, metadata );

		return metadata;
	}

	static createRoadMarkingMetadata ( name: string, guid: string, path: string ): Metadata {

		return {
			guid: guid,
			importer: MetaImporter.ROAD_MARKING,
			data: {},
			path: path,
		};

	}

	static createRoadStyleMetadata ( name: string, guid: string, path: string ): Metadata {

		return {
			guid: guid,
			importer: RoadStyle.importer,
			data: {},
			path: path,
		};

	}

	static createEntityMetadata ( name: string, guid: string, path: string ): Metadata {

		return {
			guid: guid,
			importer: MetaImporter.ENTITY,
			data: {},
			path: path,
		};

	}

	static createFolderMetadata ( path: string ): Metadata {

		const guid = THREE.MathUtils.generateUUID();

		const metadata = { guid: guid, isFolder: true, path: path, importer: null, data: null };

		this.saveMetadataFile( path, metadata );

		AssetDatabase.setMetadata( guid, metadata );

		return metadata;
	}

	static createSceneMetadata ( name: string, guid: string, path: string ): any {

		return {
			guid: guid,
			importer: MetaImporter.SCENE,
			data: {},
			path: path
		};

	}

	static createModelMetadata ( name: string, guid: string, path: string ): any {

		return {
			guid: guid,
			importer: MetaImporter.MODEL,
			data: { name: name, rotationVariance: new Vector3( 0, 0, 0 ), scaleVariance: new Vector3( 0, 0, 0 ) },
			path: path
		};

	}

	static createOpenDriveMetadata ( name: string, guid: string, path: string ): any {

		return {
			guid: guid,
			importer: MetaImporter.OPENDRIVE,
			data: {},
			path: path
		};

	}

	static createOpenScenarioMetadata ( name: string, guid: string, path: string ): any {

		return {
			guid: guid,
			importer: MetaImporter.OPENSCENARIO,
			data: {},
			path: path
		};

	}

	static createMaterialMetadata ( name: string, guid: string, path: string ): any {

		return {
			guid: guid,
			importer: MetaImporter.MATERIAL,
			data: {},
			path: path,
		};

	}

	static createGeometryMetadata ( name: string, guid: string, path: string ): any {

		return {
			guid: guid,
			importer: MetaImporter.GEOMETRY,
			data: {},
			path: path,
		};

	}

	static createPrefabMetadata ( name: string, guid: string, path: string ): any {

		return {
			guid: guid,
			importer: MetaImporter.PREFAB,
			data: {},
			path: path,
		};

	}

	static createObjectMetadata ( name: string, guid: string, path: string ): any {

		return {
			guid: guid,
			importer: MetaImporter.OBJECT,
			data: {},
			path: path,
		};

	}

	static createSignMetadata ( name: string, guid: string, path: string ): any {

		return {
			guid: guid,
			importer: MetaImporter.SIGN,
			data: {},
			path: path,
		};

	}
}

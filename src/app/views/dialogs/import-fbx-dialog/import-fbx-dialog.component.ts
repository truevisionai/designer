/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { AssetFactory } from 'app/core/asset/asset-factory.service';
import { MetadataFactory } from 'app/factories/metadata-factory.service';
import { ThreeJsUtils } from 'app/core/utils/threejs-utils';
import { TvMaterial } from 'app/modules/three-js/objects/tv-material.model';
import { TvMesh, TvPrefab } from 'app/modules/three-js/objects/tv-prefab.model';
import { CoordinateSystem } from 'app/services/exporter.service';
import { Group, Material, Mesh, Object3D } from 'three';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { FileUtils } from '../../../core/io/file-utils';
import { FileService } from '../../../core/io/file.service';

export class ImportFbxDialogData {
	constructor ( public path: string, public destinationPath: string, public extension: string ) {
	}
}

@Component( {
	selector: 'app-import-fbx-dialog',
	templateUrl: './import-fbx-dialog.component.html',
	styleUrls: [ './import-fbx-dialog.component.scss' ]
} )
export class ImportFbxDialogComponent implements OnInit {

	object: Object3D;

	scale = 1;

	destinationFolder: string;
	private materialUuidMap = new Map<string, string>();
	private geometryUuidMap = new Map<string, string>();

	constructor (
		private dialogRef: MatDialogRef<ImportFbxDialogComponent>,
		@Inject( MAT_DIALOG_DATA ) public data: ImportFbxDialogData,
		private fileService: FileService,
	) {
	}

	async ngOnInit () {

		const loader = new FBXLoader();

		const buffer = await this.fileService.readAsArrayBuffer( this.data.path );

		const directory = FileUtils.getDirectoryFromPath( this.data.path );

		this.object = loader.parse( buffer, directory );

	}

	onScaleChanged ( $scale ) {

		// this.object?.scale.setScalar( $scale );

	}

	import () {

		const directory = FileUtils.getDirectoryFromPath( this.data.destinationPath );

		const folder = AssetFactory.createNewFolder( directory );

		this.destinationFolder = folder.path;

		ThreeJsUtils.changeCoordinateSystem( this.object, CoordinateSystem.UNITY_GLTF, CoordinateSystem.OPEN_DRIVE );

		const prefab = new TvPrefab();

		prefab.add( this.makePrefab( this.object ) );

		this.saveObject( prefab );

		this.dialogRef.close();

	}

	makePrefab ( object: Object3D ): TvPrefab {

		const prefab = new TvPrefab();

		prefab.copy( object as any, false );

		object.children.forEach( child => {

			prefab.add( this.parseChild( child ) );

		} );

		return prefab;
	}

	parseChild ( object: Object3D ): Object3D {

		if ( object instanceof Mesh ) {

			const mesh = new TvMesh( object.uuid, object.name );

			mesh.copy( object as any, false );

			if ( object.material instanceof Array ) {

				mesh.materialGuid = object.material.map(
					material => this.saveMaterial( material )
				);

			} else {

				mesh.materialGuid = this.saveMaterial( object.material );

			}

			mesh.material = object.material;

			if ( object.geometry ) {

				mesh.geometry = object.geometry;

				mesh.geometryGuid = this.saveGeometry( mesh );

			}

			return mesh;
		} else if ( object instanceof Group ) {

			const prefab = new TvPrefab();

			prefab.copy( object as any, false );

			object.children.forEach( child => {

				prefab.add( this.parseChild( child ) );

			} );

			return prefab;

		} else if ( object instanceof Object3D ) {

			const prefab = new TvPrefab();

			prefab.copy( object as any, false );

			object.children.forEach( child => {

				prefab.add( this.parseChild( child ) );

			} );

		} else {

			console.error( object );

			return new TvPrefab();

		}
	}

	saveObject ( prefab: TvPrefab ) {

		// const directory = FileUtils.getDirectoryFromPath( this.data.destinationPath );

		const filename = 'imported-prefab';

		const extension = 'prefab';

		const destinationPath = this.fileService.join( this.destinationFolder, filename + '.' + extension );

		const metadata = MetadataFactory.createMetadata( filename, extension, destinationPath, prefab.guid );

		AssetFactory.updatePrefab( metadata.path, prefab );

		AssetDatabase.setInstance( metadata.guid, prefab );

		return metadata.guid;
	}


	saveGeometry ( mesh: TvMesh ): string {

		if ( this.geometryUuidMap.has( mesh.geometry.uuid ) ) {

			console.log( 'geometry already saved', mesh.geometry.uuid, mesh.geometry.name );

			return this.geometryUuidMap.get( mesh.geometry.uuid );
		}


		const filename = mesh.name + '-geometry' || mesh.geometry.uuid;

		const extension = 'geometry';

		const destinationPath = this.fileService.join( this.destinationFolder, filename + '.' + extension );

		const metadata = MetadataFactory.createMetadata( filename, extension, destinationPath, mesh.geometry.uuid );

		AssetFactory.updateGeometry( metadata.path, mesh.geometry );

		AssetDatabase.setInstance( metadata.guid, mesh.geometry );

		this.geometryUuidMap.set( mesh.geometry.uuid, metadata.guid );

		return metadata.guid;
	}

	saveMaterial ( material: Material ): string {

		if ( this.materialUuidMap.has( material.uuid ) ) {

			console.log( 'material already saved', material.uuid, material.name );

			return this.materialUuidMap.get( material.uuid );
		}

		// const directory = FileUtils.getDirectoryFromPath( this.data.destinationPath );

		const filename = FileUtils.getFilenameFromPath( material.name );

		const extension = 'material';

		const destinationPath = this.fileService.join( this.destinationFolder, filename + '.' + extension );

		const tvMaterial = new TvMaterial( material.uuid ).copy( material );

		const metadata = MetadataFactory.createMetadata( filename, extension, destinationPath, tvMaterial.guid );

		AssetFactory.updateMaterial( metadata.path, tvMaterial );

		AssetDatabase.setInstance( metadata.guid, tvMaterial );

		this.materialUuidMap.set( material.uuid, metadata.guid );

		return metadata.guid;
	}

}

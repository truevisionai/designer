/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { FileUtils } from "../io/file-utils";
import { FileExtension } from "../io/file-extension";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FileService } from "../io/file.service";
import { PreloadApiService } from "../services/preload-api.service";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { TvConsole } from "../core/utils/console";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { ThreeJsUtils } from "../core/utils/threejs-utils";
import { CoordinateSystem } from "../services/CoordinateSystem";
import { StorageService } from "../io/storage.service";
import { AssetDatabase } from "../assets/asset-database";
import { Object3D } from "three";
import { AssetService } from "../assets/asset.service";
import { Asset, AssetType } from "../assets/asset.model";
import { Importer } from "../core/interfaces/importer";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";
import { SnackBar } from 'app/services/snack-bar.service';
import { MaterialAsset } from 'app/assets/material/tv-material.asset';
import { TvMaterialExporter } from 'app/assets/material/tv-material.exporter';
import { TvMaterialLoader } from 'app/assets/material/tv-material.loader';
import { TvMaterialService } from 'app/assets/material/tv-material.service';
import { TvObjectAsset } from 'app/assets/object/tv-object.asset';
import { TvObjectExporter } from 'app/assets/object/tv-object.exporter';
import { TvTextureLoader } from 'app/assets/texture/tv-texture.loader';
import { TvTextureService } from 'app/assets/texture/tv-texture.service';

@Injectable( {
	providedIn: 'root'
} )
export class ModelImporter implements Importer {

	constructor (
		private fileService: FileService,
		private preload: PreloadApiService,
		private storageService: StorageService,
		private textureLoader: TvTextureLoader,
		private objectExporter: TvObjectExporter,
		private textureService: TvTextureService,
		private materialService: TvMaterialService,
		private materialLoader: TvMaterialLoader,
		private materialExporter: TvMaterialExporter,
		private assetService: AssetService,
		private snackBar: SnackBar
	) {
	}

	async import ( sourcePath: string, destinationFolder: string ): Promise<void> {

		const extension = FileUtils.getExtensionFromPath( sourcePath ).toLowerCase();

		switch ( extension ) {

			case FileExtension.GLTF:
				await this.importGLTF( sourcePath, destinationFolder );
				break;

			case FileExtension.GLB:
				await this.importGLB( sourcePath, destinationFolder );
				break;

			case FileExtension.OBJ:
				await this.importOBJ( sourcePath, destinationFolder );
				break;

			case FileExtension.FBX:
				await this.importFBX( sourcePath, destinationFolder );
				break;

			case FileExtension.DAE:
				await this.importDAE( sourcePath, destinationFolder );
				break;
		}

	}

	private async importGLTF ( sourcePath: string, destinationFolder: string ): Promise<void> {

		const sourceFolder = FileUtils.getDirectoryFromPath( sourcePath ) + '/';

		const loader = new GLTFLoader();

		const json = await this.fileService.readAsync( sourcePath );

		const gltf = await loader.parseAsync( json, sourceFolder );

		this.createAssets( sourcePath, destinationFolder, gltf.scene );

	}

	private async importGLB ( sourcePath: string, destinationFolder: string ): Promise<void> {

		const sourceFolder = FileUtils.getDirectoryFromPath( sourcePath ) + '/';

		const loader = new GLTFLoader();

		const buffer = await this.fileService.readAsArrayBuffer( sourcePath );

		const gltf = await loader.parseAsync( buffer, sourceFolder );

		this.createAssets( sourcePath, destinationFolder, gltf.scene );

	}

	private async importFBX ( sourcePath: string, destinationFolder: string ): Promise<void> {

		const loader = new FBXLoader();

		const buffer = await this.fileService.readAsArrayBuffer( sourcePath );

		try {

			const sourceFolder = FileUtils.getDirectoryFromPath( sourcePath ) + '/';

			const object3d = loader.parse( buffer, sourceFolder );

			this.createAssets( sourcePath, destinationFolder, object3d );

		} catch ( e ) {

			const glbPath = await this.convertToGLB( sourcePath );

			await this.importGLB( glbPath, destinationFolder );

		}

	}

	private async importDAE ( sourcePath: string, destinationFolder: string ): Promise<void> {

		const sourceFolder = FileUtils.getDirectoryFromPath( sourcePath ) + '/';

		const loader = new ColladaLoader();

		const text = this.storageService.readSync( sourcePath );

		const group = loader.parse( text, sourceFolder );

		this.createAssets( sourcePath, destinationFolder, group.scene );

	}

	private async createAssets ( sourcePath: string, destinationFolder: string, object: Object3D ): Promise<void> {

		ThreeJsUtils.changeCoordinateSystem( object, CoordinateSystem.UNITY_GLTF, CoordinateSystem.OPEN_DRIVE );

		object.updateMatrixWorld( true );

		this.flipUVs( object );

		const json = object.toJSON();

		await this.saveTextures( json, destinationFolder );

		await this.saveMaterials( json, destinationFolder );

		await this.saveObject( sourcePath, destinationFolder, object );

		// NOTE: DONT REMOVE THIS LINE
		// flip again to revert the changes
		this.flipUVs( object );
	}

	private async importOBJ ( sourcePath: string, destinationFolder: string ): Promise<void> {

		const loader = new OBJLoader();

		const text = await this.fileService.readAsync( sourcePath );

		const object = loader.parse( text );

		this.createAssets( sourcePath, destinationFolder, object );

	}

	private async saveMaterials ( json: any, destinationFolder: string ): Promise<void> {

		if ( !json?.materials ) return;

		for ( const data of json.materials ) {

			data.guid = data.uuid;

			const material = this.materialLoader.parse( data );

			const materialAsset = new MaterialAsset( material.uuid, material );

			const materialName = ( material.name || 'material-' + material.uuid ) + '.' + FileExtension.MATERIAL;

			const materialPath = destinationFolder + '/' + materialName;

			const materialJSON = this.materialExporter.exportAsString( materialAsset );

			const meta = materialAsset.toMetadata( materialPath );

			const materialMetadata = JSON.stringify( meta, null, 2 );

			this.storageService.writeSync( materialPath, materialJSON );

			this.storageService.writeSync( materialPath + '.meta', materialMetadata );

			this.materialService.addMaterial( materialAsset );

			const asset = new Asset( AssetType.MATERIAL, materialAsset.guid, materialPath, meta );

			this.assetService.addAsset( asset );

		}

	}

	private async saveTextures ( json: any, destinationFolder: string ): Promise<void> {

		if ( !json.textures ) return;

		for ( const texture of json.textures ) {

			await this.saveTexture( json, texture, destinationFolder );

		}

	}

	async saveTexture ( json: any, texture: any, destinationFolder: string ): Promise<void> {

		if ( typeof texture.image !== 'string' ) return;

		const imagePath = this.saveImage( json, texture, destinationFolder );

		if ( !imagePath ) return;

		const textureAsset = await this.textureLoader.loadAsyncPath( texture, imagePath, texture.uuid );

		const metadata = textureAsset.toMetadata( imagePath );

		const textureMetadata = JSON.stringify( metadata, null, 2 );

		this.storageService.writeSync( imagePath + '.meta', textureMetadata );

		this.textureService.addTexture( textureAsset.guid, textureAsset );

		const asset = new Asset( AssetType.MATERIAL, textureAsset.guid, imagePath, metadata );

		this.assetService.addAsset( asset );

	}

	private saveImage ( json: any, texture: any, destinationFolder: string ): string {

		const image = json?.images.find( image => image.uuid === texture.image );

		if ( !image ) return;

		const data = image.url.split( ',' )[ 1 ]; // Get the base64 encoded string

		if ( !data ) {
			TvConsole.error( 'Image data not found' );
			return;
		}

		const buffer = this.preload.buffer.from( data, 'base64' ); // Convert base64 to binary buffer

		const extension = image.url.match( /image\/(png|jpeg);/ )[ 1 ]; // Detect the extension (PNG or JPEG)

		const imageName = ( texture.name || 'images-' + image.uuid ) + '.' + extension;

		const imagePath = destinationFolder + '/' + imageName;

		this.storageService.writeSync( imagePath, buffer ); // Write the file as binary data

		return imagePath;

	}

	private saveObject ( sourcePath: string, destinationFolder: string, object: Object3D ): void {

		const filename = FileUtils.getFilenameWithoutExtension( sourcePath );

		const objectAsset = new TvObjectAsset( object.uuid, object );

		const objectName = ( filename || 'object-' + object.uuid ) + '.' + FileExtension.OBJECT;

		const objectPath = destinationFolder + '/' + objectName;

		const metadata = objectAsset.toMetadata( objectPath );

		const objectJSON = JSON.stringify( metadata, null, 2 );

		this.storageService.writeSync( objectPath, this.objectExporter.exportAsString( objectAsset ) );

		this.storageService.writeSync( objectPath + '.meta', objectJSON );

		AssetDatabase.setInstance( objectAsset.guid, objectAsset );

		const asset = new Asset( AssetType.OBJECT, objectAsset.guid, objectPath, metadata );

		this.assetService.addAsset( asset );

		this.assetService.assetCreated.emit( asset );

		this.snackBar.success( 'New Asset Imported' );

	}

	private async convertToGLB ( sourcePath: string, successCallback?: Function, errorCallback?: Function ): Promise<any> {

		const extension = FileUtils.getExtensionFromPath( sourcePath );

		// Assuming FileUtils.getExtensionFromPath returns extension with dot (e.g., '.fbx')
		let destinationPath = "";

		// Check if sourcePath actually contains the extension
		if ( sourcePath.endsWith( extension ) ) {

			// Remove the extension and append '.glb'
			destinationPath = sourcePath.substring( 0, sourcePath.length - extension.length ) + FileExtension.GLB;

		} else {
			// Handle the unexpected case where the extension is not at the end
			console.error( "Unexpected condition: the sourcePath does not end with the expected extension." );
			if ( errorCallback ) errorCallback( "Source path does not end with the expected extension." );
			return; // Exit the function
		}

		const outputPath = await this.preload.fbxToGlTF.convert( sourcePath, destinationPath );

		TvConsole.info( `Conversion success. File import ${ outputPath }` );

		return outputPath;

	}

	private flipUVs ( object: Object3D ): void {

		// Traverse and conditionally modify UVs after the system change
		object.traverse( function ( child ) {
			if ( child[ 'isMesh' ] ) {
				const uvAttribute = child[ 'geometry' ].attributes.uv;
				if ( uvAttribute ) {
					for ( let i = 0; i < uvAttribute.count; i++ ) {
						uvAttribute.setY( i, 1 - uvAttribute.getY( i ) );  // Flip UVs vertically
					}
					uvAttribute.needsUpdate = true;
				}
			}
		} );
	}

}

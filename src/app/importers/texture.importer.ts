/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { FileUtils } from "../io/file-utils";
import { TvConsole } from "../core/utils/console";
import { RepeatWrapping, TextureLoader, UVMapping } from "three";
import { StorageService } from "../io/storage.service";
import { AssetService } from "../assets/asset.service";
import { Asset, AssetType } from "../assets/asset.model";
import { TGALoader } from "three/examples/jsm/loaders/TGALoader";
import { SnackBar } from "../services/snack-bar.service";
import { FileExtension } from "../io/file-extension";
import { Importer } from "../core/interfaces/importer";
import { TextureAsset, TvTexture } from "../assets/texture/tv-texture.model";
import { TvTextureService } from "../assets/texture/tv-texture.service";

@Injectable( {
	providedIn: 'root'
} )
export class TextureImporter implements Importer {

	constructor (
		private assetService: AssetService,
		private storageService: StorageService,
		private textureService: TvTextureService,
		private snackBar: SnackBar
	) {
	}

	async import ( sourcePath: string, destinationFolder: string ): Promise<void> {

		const extension = FileUtils.getExtensionFromPath( sourcePath ).toLowerCase();

		switch ( extension ) {

			case FileExtension.JPG:
				this.importTexture( sourcePath, destinationFolder );
				break;

			case FileExtension.JPEG:
				this.importTexture( sourcePath, destinationFolder );
				break;

			case FileExtension.PNG:
				this.importTexture( sourcePath, destinationFolder );
				break;

			case FileExtension.TGA:
				this.importTGA( sourcePath, destinationFolder );
				break;

			case FileExtension.SVG:
				this.importTexture( sourcePath, destinationFolder );
				break;

			default:
				TvConsole.error( `${ extension } texture not supported` );
				break;

		}

	}

	private importTexture ( sourcePath: string, destinationFolder: string ): any {

		try {

			const texture = new TextureLoader().load( sourcePath );

			texture.wrapS = RepeatWrapping;
			texture.wrapT = RepeatWrapping;
			texture.mapping = UVMapping;
			texture.repeat.set( 1, 1 );

			const tvTexture = TvTexture.createFromTexture( texture.uuid, texture );

			this.createTextureAsset( tvTexture, sourcePath, destinationFolder );

		} catch ( error ) {

			this.snackBar?.error( error );

			return null;

		}

	}

	private createTextureAsset ( texture: TvTexture, sourcePath: string, destinationFolder: string ): void {

		const textureAsset = new TextureAsset( texture.guid, texture );

		const sourceFilename = FileUtils.getFilenameFromPath( sourcePath );

		const destinationPath = this.storageService.join( destinationFolder, sourceFilename );

		this.storageService.copyFileSync( sourcePath, destinationPath );

		const metadata = textureAsset.toMetadata( destinationPath );

		const contents = JSON.stringify( metadata, null, 2 )

		this.storageService.writeSync( destinationPath + '.meta', contents );

		this.textureService.addTexture( texture.guid, textureAsset );

		const asset = new Asset( AssetType.TEXTURE, texture.guid, destinationPath, metadata );

		this.assetService.addAsset( asset );

		this.assetService.assetCreated.emit( asset );

	}

	private importTGA ( sourcePath: string, destinationFolder: string ): any {

		try {

			const texture = new TGALoader().load( sourcePath );

			texture.wrapS = RepeatWrapping;
			texture.wrapT = RepeatWrapping;
			texture.mapping = UVMapping;
			texture.repeat.set( 1, 1 );

			const tvTexture = TvTexture.createFromTexture( texture.uuid, texture );

			this.createTextureAsset( tvTexture, sourcePath, destinationFolder );

		} catch ( error ) {

			this.snackBar?.error( error );

			return null;

		}
	}
}

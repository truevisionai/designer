/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetService } from "../../assets/asset.service";
import { TextureAsset, TvTexture } from "./tv-texture.model";
import { StorageService } from "../../io/storage.service";
import { Asset } from "../../assets/asset.model";

@Injectable( {
	providedIn: 'root'
} )
export class TvTextureService {

	constructor (
		private assetService: AssetService,
		private storageService: StorageService,
	) {
	}

	getTexture ( guid: string ): TextureAsset {

		return this.assetService.getInstance<TextureAsset>( guid );

	}

	addTexture ( guid: string, asset: TextureAsset ): void {

		this.assetService.setInstance( guid, asset );

	}

	update ( asset: Asset ): void {

		if ( !asset ) return;

		const texture = this.getTexture( asset.guid );

		try {

			const contents = JSON.stringify( texture.toMetadata( asset.path ), null, 2 );

			this.storageService.writeSync( asset.path + '.meta', contents );

		} catch ( e ) {

			console.error( e );

		}

	}

}

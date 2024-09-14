/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Asset, AssetType } from "../assets/asset.model";
import { TvTextureFactory } from "../assets/texture/tv-texture.factory";
import { TvMaterialFactory } from "../assets/material/tv-material.factory";

export interface Factory {

	createNew (): void;

}

@Injectable( {
	providedIn: 'root'
} )
export class FactoryProvider {

	constructor () {
	}

	getFactory ( type: AssetType ): Factory {

		switch ( type ) {

			case AssetType.TEXTURE:
				return new TvTextureFactory();

			case AssetType.MATERIAL:
				return new TvMaterialFactory();

		}

	}

}



@Injectable( {
	providedIn: 'root'
} )
export class MockAssetFactory {

	static createAsset ( type: AssetType ): Asset {

		switch ( type ) {

			case AssetType.TEXTURE:
				return new Asset( type, 'texture', 'path/to/texture' );

			case AssetType.MATERIAL:
				return new Asset( type, 'material', 'path/to/material' );
		}

	}


}

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetType } from "../assets/asset.model";
import { TvTextureFactory } from "../assets/texture/tv-texture.factory";
import { TvMaterialFactory } from "../assets/material/tv-material.factory";

export interface AssetFactory {

	createNew (): void;

}

@Injectable( {
	providedIn: 'root'
} )
export class AssetFactoryProvider {

	constructor () {
	}

	getFactory ( type: AssetType ): AssetFactory {

		switch ( type ) {

			case AssetType.TEXTURE:
				return new TvTextureFactory();

			case AssetType.MATERIAL:
				return new TvMaterialFactory();

		}

	}
}
